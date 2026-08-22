function compile(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader) || "shader compilation failed";
    gl.deleteShader(shader);
    throw new Error(message);
  }
  return shader;
}

function createProgram(gl) {
  const vertex = compile(gl, gl.VERTEX_SHADER, `#version 300 es
    in vec3 a_position;
    in vec3 a_normal;
    uniform mat4 u_mvp;
    uniform mat4 u_model;
    out vec3 v_normal;
    void main() {
      gl_Position = u_mvp * vec4(a_position, 1.0);
      v_normal = mat3(u_model) * a_normal;
    }
  `);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, `#version 300 es
    precision highp float;
    in vec3 v_normal;
    uniform vec4 u_color;
    out vec4 outColor;
    void main() {
      vec3 n = normalize(v_normal);
      vec3 light = normalize(vec3(-0.35, 0.65, 0.68));
      float diffuse = 0.30 + 0.70 * max(dot(n, light), 0.0);
      outColor = vec4(u_color.rgb * diffuse, u_color.a);
    }
  `);
  const program = gl.createProgram();
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) || "program link failed");
  return program;
}

function perspective(fovy, aspect, near, far) {
  const f = 1 / Math.tan(fovy / 2);
  const nf = 1 / (near - far);
  return new Float32Array([
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (far + near) * nf, -1,
    0, 0, 2 * far * near * nf, 0
  ]);
}

function identity() {
  return new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]);
}

function multiply(a, b) {
  const out = new Float32Array(16);
  for (let col = 0; col < 4; col += 1) {
    for (let row = 0; row < 4; row += 1) {
      out[col * 4 + row] =
        a[row] * b[col * 4] +
        a[4 + row] * b[col * 4 + 1] +
        a[8 + row] * b[col * 4 + 2] +
        a[12 + row] * b[col * 4 + 3];
    }
  }
  return out;
}

function translation(x, y, z) {
  const out = identity();
  out[12] = x; out[13] = y; out[14] = z;
  return out;
}

function normalize(v) {
  const len = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / len, v[1] / len, v[2] / len];
}

function cross(a, b) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0]
  ];
}

function subtract(a, b) { return [a[0]-b[0], a[1]-b[1], a[2]-b[2]]; }

function lookAt(eye, center, up) {
  const z = normalize(subtract(eye, center));
  const x = normalize(cross(up, z));
  const y = cross(z, x);
  return new Float32Array([
    x[0], y[0], z[0], 0,
    x[1], y[1], z[1], 0,
    x[2], y[2], z[2], 0,
    -x[0]*eye[0]-x[1]*eye[1]-x[2]*eye[2],
    -y[0]*eye[0]-y[1]*eye[1]-y[2]*eye[2],
    -z[0]*eye[0]-z[1]*eye[1]-z[2]*eye[2],
    1
  ]);
}

function pushTri(positions, normals, a, b, c, normal) {
  positions.push(...a, ...b, ...c);
  normals.push(...normal, ...normal, ...normal);
}

function axialFrustum(length, radiusStart, radiusEnd, segments = 36, capped = true, innerStart = 0, innerEnd = 0) {
  const positions = [];
  const normals = [];
  const slope = (radiusStart - radiusEnd) / Math.max(length, 1e-9);
  for (let i = 0; i < segments; i += 1) {
    const a0 = (i / segments) * Math.PI * 2;
    const a1 = ((i + 1) / segments) * Math.PI * 2;
    const c0 = Math.cos(a0), s0 = Math.sin(a0), c1 = Math.cos(a1), s1 = Math.sin(a1);
    const p00 = [0, radiusStart * c0, radiusStart * s0];
    const p01 = [0, radiusStart * c1, radiusStart * s1];
    const p10 = [length, radiusEnd * c0, radiusEnd * s0];
    const p11 = [length, radiusEnd * c1, radiusEnd * s1];
    const n0 = normalize([slope, c0, s0]);
    const n1 = normalize([slope, c1, s1]);
    positions.push(...p00, ...p10, ...p11, ...p00, ...p11, ...p01);
    normals.push(...n0, ...n0, ...n1, ...n0, ...n1, ...n1);

    if (innerStart > 0 && innerEnd > 0) {
      const q00 = [0, innerStart * c0, innerStart * s0];
      const q01 = [0, innerStart * c1, innerStart * s1];
      const q10 = [length, innerEnd * c0, innerEnd * s0];
      const q11 = [length, innerEnd * c1, innerEnd * s1];
      const in0 = normalize([-slope, -c0, -s0]);
      const in1 = normalize([-slope, -c1, -s1]);
      positions.push(...q00, ...q11, ...q10, ...q00, ...q01, ...q11);
      normals.push(...in0, ...in1, ...in0, ...in0, ...in1, ...in1);
      pushTri(positions, normals, p00, p01, q01, [-1,0,0]);
      pushTri(positions, normals, p00, q01, q00, [-1,0,0]);
      pushTri(positions, normals, p10, q11, p11, [1,0,0]);
      pushTri(positions, normals, p10, q10, q11, [1,0,0]);
    } else if (capped) {
      pushTri(positions, normals, [0,0,0], p01, p00, [-1,0,0]);
      pushTri(positions, normals, [length,0,0], p10, p11, [1,0,0]);
    }
  }
  return { positions: new Float32Array(positions), normals: new Float32Array(normals) };
}

function bladeRing(object) {
  const positions = [];
  const normals = [];
  const count = Math.min(object.bladeCount, 48);
  const half = object.length / 2;
  const tangential = Math.max(object.bladeThickness, object.tipRadius * 0.025);
  for (let i = 0; i < count; i += 1) {
    const angle = (i / count) * Math.PI * 2;
    const c = Math.cos(angle), s = Math.sin(angle);
    const tc = -s, ts = c;
    const inner = object.hubRadius;
    const outer = object.tipRadius;
    const points = [
      [-half, inner*c - tangential*tc, inner*s - tangential*ts],
      [-half, inner*c + tangential*tc, inner*s + tangential*ts],
      [-half, outer*c + tangential*0.45*tc, outer*s + tangential*0.45*ts],
      [-half, outer*c - tangential*0.45*tc, outer*s - tangential*0.45*ts],
      [ half, inner*c - tangential*tc, inner*s - tangential*ts],
      [ half, inner*c + tangential*tc, inner*s + tangential*ts],
      [ half, outer*c + tangential*0.45*tc, outer*s + tangential*0.45*ts],
      [ half, outer*c - tangential*0.45*tc, outer*s - tangential*0.45*ts]
    ];
    const faces = [[0,1,2,3],[4,7,6,5],[0,4,5,1],[1,5,6,2],[2,6,7,3],[3,7,4,0]];
    for (const [a,b,cidx,d] of faces) {
      const pa = points[a], pb = points[b], pc = points[cidx], pd = points[d];
      const normal = normalize(cross(subtract(pb, pa), subtract(pc, pa)));
      pushTri(positions, normals, pa, pb, pc, normal);
      pushTri(positions, normals, pa, pc, pd, normal);
    }
  }
  return { positions: new Float32Array(positions), normals: new Float32Array(normals) };
}

function meshFor(object) {
  if (object.type === "blade_ring") return bladeRing(object);
  if (["tube","ring","housing"].includes(object.type)) return axialFrustum(object.length, object.outerRadius, object.outerRadius, 40, false, object.innerRadius, object.innerRadius);
  if (["frustum","cone"].includes(object.type)) return axialFrustum(object.length, object.radiusStart, object.radiusEnd, 40, true);
  if (["cylinder","shaft","disk"].includes(object.type)) return axialFrustum(object.length, object.radius, object.radius, 40, true);
  return null;
}

const COLORS = {
  inlet: [0.28, 0.36, 0.48, 1],
  compressor: [0.12, 0.42, 0.92, 1],
  shaft: [0.36, 0.42, 0.5, 1],
  combustor: [0.82, 0.47, 0.08, 1],
  turbine: [0.92, 0.28, 0.08, 1],
  casing: [0.12, 0.18, 0.28, 0.30],
  nozzle: [0.3, 0.38, 0.5, 1]
};

export function createWebGLRenderer(canvas) {
  const gl = canvas.getContext("webgl2", { antialias: true, alpha: false });
  if (!gl) return null;
  const program = createProgram(gl);
  const positionLoc = gl.getAttribLocation(program, "a_position");
  const normalLoc = gl.getAttribLocation(program, "a_normal");
  const mvpLoc = gl.getUniformLocation(program, "u_mvp");
  const modelLoc = gl.getUniformLocation(program, "u_model");
  const colorLoc = gl.getUniformLocation(program, "u_color");
  const cache = new Map();

  function upload(object) {
    const key = JSON.stringify([object.type, object.radius, object.outerRadius, object.innerRadius, object.radiusStart, object.radiusEnd, object.hubRadius, object.tipRadius, object.length, object.bladeCount, object.bladeThickness]);
    if (cache.has(key)) return cache.get(key);
    const mesh = meshFor(object);
    if (!mesh) return null;
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, mesh.positions, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0);
    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, mesh.normals, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(normalLoc);
    gl.vertexAttribPointer(normalLoc, 3, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);
    const entry = { vao, count: mesh.positions.length / 3 };
    cache.set(key, entry);
    return entry;
  }

  function render(document, view) {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const width = Math.max(1, Math.floor(rect.width * dpr));
    const height = Math.max(1, Math.floor(rect.height * dpr));
    if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
    gl.viewport(0, 0, width, height);
    gl.clearColor(0.025, 0.035, 0.055, 1);
    gl.clearDepth(1);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(program);

    const length = document?.metadata?.parameters?.engineLengthMm ?? 900;
    const radius = document?.metadata?.parameters?.outerDiameterMm ? document.metadata.parameters.outerDiameterMm / 2 : 160;
    const target = [length * 0.5, 0, 0];
    const distance = Math.max(length * 1.25, radius * 5) / Math.max(view.zoom || 1, 0.25);
    const cp = Math.cos(view.pitch), sp = Math.sin(view.pitch), cy = Math.cos(view.yaw), sy = Math.sin(view.yaw);
    const eye = [target[0] + distance * cp * cy, target[1] + distance * sp, target[2] + distance * cp * sy];
    const projection = perspective(Math.PI / 4.2, width / height, 1, Math.max(10000, distance * 6));
    const viewMatrix = lookAt(eye, target, [0,1,0]);
    const vp = multiply(projection, viewMatrix);

    const objects = document.objects.filter((object) => object.visible !== false && (object.id !== "outer_casing" || view.casingVisible));
    const explode = { inlet: -75, compressor: -35, shaft: 0, casing: 0, combustor: 20, turbine: 55, nozzle: 95 };
    const ordered = [...objects].sort((a,b) => Number(Boolean(a.translucent)) - Number(Boolean(b.translucent)));
    for (const object of ordered) {
      const mesh = upload(object);
      if (!mesh) continue;
      const baseX = object.transform?.translate?.[0] ?? 0;
      const x = baseX + (view.exploded ? (explode[object.group] ?? 0) : 0);
      const model = translation(x, 0, 0);
      const mvp = multiply(vp, model);
      const baseColor = COLORS[object.group] ?? [0.45,0.5,0.58,1];
      const color = view.selected === object.id ? [0.96,0.98,1,1] : baseColor;
      gl.uniformMatrix4fv(mvpLoc, false, mvp);
      gl.uniformMatrix4fv(modelLoc, false, model);
      gl.uniform4fv(colorLoc, color);
      gl.bindVertexArray(mesh.vao);
      gl.drawArrays(gl.TRIANGLES, 0, mesh.count);
    }
    gl.bindVertexArray(null);
    canvas.dataset.renderer = "webgl2";
  }

  return { render, kind: "webgl2" };
}
