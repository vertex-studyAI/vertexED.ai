#!/usr/bin/env python3
from __future__ import annotations
import argparse, asyncio, hashlib, json, os, re, signal, subprocess, time
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path

BUNDLE=Path(__file__).resolve().parent
MANIFEST=BUNDLE/'manifest_v3_128.json'
SOURCE=BUNDLE/'source'
SUCCESS={'ok','dry_run','resumed_ok'}

def now(): return datetime.now(timezone.utc).isoformat()
def sha(path):
    h=hashlib.sha256()
    with path.open('rb') as f:
        for c in iter(lambda:f.read(1<<20),b''): h.update(c)
    return h.hexdigest()
def atomic(path,obj):
    tmp=path.with_suffix(path.suffix+'.tmp'); tmp.write_text(json.dumps(obj,indent=2,sort_keys=True)); os.replace(tmp,path)
def clean(s): return re.sub(r'[^A-Za-z0-9._-]+','_',s.strip())[:100] or 'task'

def args():
    p=argparse.ArgumentParser(description='Percy 128-job v3 evidence-gated wave')
    p.add_argument('--repo',default=os.environ.get('PERCY_ROOT') or os.getcwd())
    p.add_argument('--seconds',type=int,default=int(os.environ.get('WAVE_SECONDS','10800')))
    p.add_argument('--parallel',type=int,default=int(os.environ.get('PERCY_PARALLEL','4')))
    p.add_argument('--verify-parallel',type=int,default=int(os.environ.get('VERIFY_PARALLEL','2')))
    p.add_argument('--resume',type=Path)
    p.add_argument('--dry-run',action='store_true')
    p.add_argument('--allow-no-git',action='store_true')
    p.add_argument('--provider-json',default=os.environ.get('PERCY_PROVIDER_JSON'))
    p.add_argument('--deterministic-provider',action='store_true')
    p.add_argument('--min-base',type=float,default=.85)
    p.add_argument('--min-expansion',type=float,default=.85)
    return p.parse_args()

def check_repo(repo,allow):
    if not repo.is_dir(): raise SystemExit(f'bad repo: {repo}')
    if allow:return
    if subprocess.run(['git','-C',str(repo),'rev-parse','--show-toplevel'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL).returncode:
        raise SystemExit(f'not git: {repo}')

def provider_cmd(task,prompt,out,cfg):
    if cfg.deterministic_provider:
        script=("import pathlib,hashlib,sys; p=pathlib.Path(sys.argv[1]); q=sys.argv[2]; "
                "p.parent.mkdir(parents=True,exist_ok=True); "
                "p.write_text('# deterministic provider\\n\\n- prompt_sha256: `'+hashlib.sha256(q.encode()).hexdigest()+'`\\n- status: complete\\n')")
        return [os.environ.get('PYTHON','python3'),'-c',script,str(out),prompt]
    if cfg.provider_json:
        template=json.loads(cfg.provider_json)
        if not isinstance(template,list) or not template: raise SystemExit('PERCY_PROVIDER_JSON must be a JSON argv list')
        sandbox='read-only' if task['mode']=='read' else 'workspace-write'
        vals={'output':str(out),'prompt':prompt,'sandbox':sandbox,'repo':str(cfg.repo)}
        return [str(x).format(**vals) for x in template]
    sandbox='read-only' if task['mode']=='read' else 'workspace-write'
    return ['codex','exec','--ephemeral','--sandbox',sandbox,'--ask-for-approval','never','-o',str(out),prompt]

@dataclass
class Registry:
    procs:dict[str,asyncio.subprocess.Process]
    def __init__(self): self.procs={}; self.lock=asyncio.Lock()
    async def add(self,k,p):
        async with self.lock:self.procs[k]=p
    async def rm(self,k):
        async with self.lock:self.procs.pop(k,None)
    async def killall(self):
        async with self.lock: items=list(self.procs.items())
        for _,p in items:
            if p.returncode is None:
                try: os.killpg(p.pid,signal.SIGTERM)
                except ProcessLookupError: pass
        if items:
            try: await asyncio.wait_for(asyncio.gather(*(p.wait() for _,p in items),return_exceptions=True),3)
            except asyncio.TimeoutError:
                for _,p in items:
                    if p.returncode is None:
                        try: os.killpg(p.pid,signal.SIGKILL)
                        except ProcessLookupError: pass
                await asyncio.gather(*(p.wait() for _,p in items),return_exceptions=True)

class Events:
    def __init__(self,p): self.p=p
    def emit(self,event,**kw):
        with self.p.open('a') as f:f.write(json.dumps({'at':now(),'event':event,**kw},sort_keys=True)+'\n')

def successes(run):
    out={}
    for p in run.glob('*.meta.json'):
        try:r=json.loads(p.read_text())
        except:continue
        o=Path(r.get('output',''))
        if r.get('status') in SUCCESS and o.exists() and o.stat().st_size: out[r['id']]=r
    return out

def ratio(rows): return sum(r.get('status') in SUCCESS for r in rows)/len(rows) if rows else 0

async def killone(p):
    if p.returncode is not None:return
    try:os.killpg(p.pid,signal.SIGTERM)
    except ProcessLookupError:return
    try:await asyncio.wait_for(p.wait(),3)
    except asyncio.TimeoutError:
        try:os.killpg(p.pid,signal.SIGKILL)
        except ProcessLookupError:pass
        await p.wait()

async def one(task,cfg,run,deadline,sem,reg,events,prior):
    if task['id'] in prior:
        r=dict(prior[task['id']]); r['status']='resumed_ok'; events.emit('resume',id=task['id']); return r
    async with sem:
        remain=int(deadline-time.monotonic())
        if remain<=3:return {'id':task['id'],'phase':task['phase'],'status':'skipped_deadline'}
        timeout=min(int(task.get('timeout',420)),max(1,remain-1))
        out=run/f"{task['id']}_{clean(task['account'])}_{clean(task['title'])}.md"
        prompt=task['prompt'].replace('BUNDLE_SOURCE',str(run/'source')).replace('WAVE_RESULTS',str(run))
        cmd=provider_cmd(task,prompt,out,cfg)
        meta={'id':task['id'],'phase':task['phase'],'account':task['account'],'title':task['title'],'mode':task['mode'],'output':str(out),'started_at':now(),'timeout':timeout,'cmd':cmd[:-1]+['<PROMPT>'] if len(cmd)>1 else cmd}
        atomic(run/f"{task['id']}.meta.json",meta); events.emit('start',id=task['id'],phase=task['phase'])
        if cfg.dry_run:
            out.write_text(f"# dry run\n{task['title']}\n"); meta.update(status='dry_run',rc=0,finished_at=now(),output_sha256=sha(out)); atomic(run/f"{task['id']}.meta.json",meta); return meta
        p=await asyncio.create_subprocess_exec(*cmd,cwd=str(cfg.repo),stdout=asyncio.subprocess.PIPE,stderr=asyncio.subprocess.PIPE,start_new_session=True)
        await reg.add(task['id'],p); status='failed'; rc=None; so=b''; se=b''
        try:
            so,se=await asyncio.wait_for(p.communicate(),timeout); rc=p.returncode
            status='ok' if rc==0 and out.exists() and out.stat().st_size else ('missing_output' if rc==0 else 'failed')
        except asyncio.TimeoutError: status='timeout'; await killone(p)
        except asyncio.CancelledError: status='cancelled_parent'; await killone(p); raise
        finally:
            await reg.rm(task['id']); (run/f"{task['id']}.stdout.log").write_bytes(so); (run/f"{task['id']}.stderr.log").write_bytes(se)
            meta.update(status=status,rc=rc,finished_at=now())
            if out.exists() and out.stat().st_size: meta.update(output_sha256=sha(out),output_bytes=out.stat().st_size)
            atomic(run/f"{task['id']}.meta.json",meta); events.emit('finish',id=task['id'],status=status)
        return meta

async def phase(tasks,parallel,**kw):
    sem=asyncio.Semaphore(max(1,parallel)); return await asyncio.gather(*(one(t,sem=sem,**kw) for t in tasks))

def snapshot(repo,run,label):
    if (repo/'.git').exists():
        for n,c in [(f'git-status-{label}.txt',['git','-C',str(repo),'status','--short']),(f'git-diff-{label}.patch',['git','-C',str(repo),'diff','--binary'])]:
            r=subprocess.run(c,capture_output=True); (run/n).write_bytes(r.stdout+(b'\nSTDERR:\n'+r.stderr if r.stderr else b''))

def blocked(run,phase_name,reason):
    p=run/f'BLOCKED_{phase_name}.md'; p.write_text(f'# BLOCKED: {phase_name}\n\n{reason}\n'); return p

async def main():
    cfg=args(); cfg.repo=Path(cfg.repo).resolve(); check_repo(cfg.repo,cfg.allow_no_git)
    tasks=json.loads(MANIFEST.read_text())
    if len(tasks)!=128 or len({t['id'] for t in tasks})!=128: raise SystemExit('manifest must be 128 unique tasks')
    valid={'scout','builder','verify','final','deep','adversary','fix','verify2','meta','final2'}
    if any(t['phase'] not in valid for t in tasks): raise SystemExit('invalid phase')
    if not (cfg.deterministic_provider or cfg.dry_run or cfg.provider_json or shutil_which('codex')): raise SystemExit('no provider: install codex or set PERCY_PROVIDER_JSON')
    if cfg.resume:
        run=cfg.resume.resolve(); run.mkdir(parents=True,exist_ok=True)
    else:
        run=cfg.repo/'.percy'/('128-wave-'+datetime.now().strftime('%Y%m%d-%H%M%S')); run.mkdir(parents=True)
        (run/'source').mkdir()
        for p in SOURCE.glob('*'):
            if p.is_file():(run/'source'/p.name).write_bytes(p.read_bytes())
    events=Events(run/'events.jsonl'); prior=successes(run); reg=Registry(); deadline=time.monotonic()+cfg.seconds; start=time.monotonic()
    loop=asyncio.get_running_loop(); stop=asyncio.Event()
    for sig in (signal.SIGINT,signal.SIGTERM):
        try: loop.add_signal_handler(sig,stop.set)
        except NotImplementedError: pass
    async def execute():
        rows=[]
        for ph,par in [('scout',cfg.parallel),('builder',1),('verify',cfg.verify_parallel),('final',1)]:
            group=[t for t in tasks if t['phase']==ph]
            r=await phase(group,par,cfg=cfg,run=run,deadline=deadline,reg=reg,events=events,prior=prior); rows+=r; snapshot(cfg.repo,run,ph)
            if ph=='scout' and ratio(r)<cfg.min_base: blocked(run,'base-builders',f'scout ratio {ratio(r):.3f} < {cfg.min_base:.3f}'); return rows
            if ph=='builder' and ratio(r)<.80: blocked(run,'base-verify','builder gate failed'); return rows
        expansion=[]
        for ph,par in [('deep',cfg.parallel),('adversary',cfg.parallel)]:
            group=[t for t in tasks if t['phase']==ph]; r=await phase(group,par,cfg=cfg,run=run,deadline=deadline,reg=reg,events=events,prior=prior); rows+=r; expansion+=r
        if ratio(expansion)<cfg.min_expansion: blocked(run,'fix',f'expansion ratio {ratio(expansion):.3f} < {cfg.min_expansion:.3f}'); return rows
        for ph,par in [('fix',1),('verify2',cfg.verify_parallel),('meta',1),('final2',1)]:
            group=[t for t in tasks if t['phase']==ph]; r=await phase(group,par,cfg=cfg,run=run,deadline=deadline,reg=reg,events=events,prior=prior); rows+=r; snapshot(cfg.repo,run,ph)
            gate=.75 if ph=='fix' else (5/6 if ph=='verify2' else 1.0)
            if ratio(r)+1e-9<gate:
                blocked(run,'after-'+ph,f'{ph} ratio {ratio(r):.3f} < {gate:.3f}'); return rows
        return rows
    task=asyncio.create_task(execute()); stopper=asyncio.create_task(stop.wait())
    done,_=await asyncio.wait({task,stopper},return_when=asyncio.FIRST_COMPLETED)
    if stopper in done and stop.is_set() and not task.done(): task.cancel(); await reg.killall()
    try: rows=await task
    except asyncio.CancelledError: rows=[]
    stopper.cancel(); await reg.killall()
    counts={}
    for r in rows:counts[r.get('status','unknown')]=counts.get(r.get('status','unknown'),0)+1
    summary={'run_dir':str(run),'counts':counts,'rows':len(rows),'elapsed_seconds':round(time.monotonic()-start,2),'final2':any(r.get('id')=='G01' and r.get('status') in SUCCESS for r in rows)}
    atomic(run/'SUMMARY.json',summary)
    if (run/'G01_X_expanded_wave_final_synthesis.md').exists(): (run/'FINAL_HANDOFF.md').write_text((run/'G01_X_expanded_wave_final_synthesis.md').read_text())
    else: (run/'FINAL_HANDOFF.md').write_text('# Percy 128-wave handoff\n\n'+json.dumps(summary,indent=2)+'\n')
    print(json.dumps(summary,indent=2)); return 0 if summary['final2'] else 2

def shutil_which(name):
    import shutil
    return shutil.which(name)

if __name__=='__main__': raise SystemExit(asyncio.run(main()))
