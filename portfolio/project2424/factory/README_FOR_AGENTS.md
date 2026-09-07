# Instructions for Project 2424 Execution Agents

Your job is to close evidence gates, not to maximize activity or produce positive-looking results.

For the assigned child:

1. read identity/spec/protocol/evidence/state;
2. identify the earliest unmet gate;
3. execute only work that advances that gate;
4. test and preserve evidence;
5. never weaken frozen criteria after seeing outcomes;
6. never generate missing empirical results;
7. update state with exact evidence and next blocker;
8. continue until a real terminal state or an external/manual blocker is reached.

If the hypothesis fails, preserve and analyze the failure. If the child duplicates another contribution, merge it scientifically instead of creating a fake standalone paper.