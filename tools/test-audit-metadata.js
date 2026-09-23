#!/usr/bin/env node
"use strict";
const fs=require("node:fs");
const assert=require("node:assert/strict");
const version=JSON.parse(fs.readFileSync("version.json","utf8"));
const debug=JSON.parse(fs.readFileSync("DEBUG_ALL_PROGRAMS.json","utf8"));
const meta=version.full_program_debug;
const checks={
  programs_total:debug.programs,
  programs_loaded:debug.loaded,
  stateful_tests:debug.stateful_tests,
  stateful_tests_passed:debug.stateful_passed,
  full_audits_executed:debug.audits,
  full_audits_passed:debug.audit_report.filter(x=>!x.error&&x.pass!==false).length,
};
for(const [key,value] of Object.entries(checks)){
  assert.equal(meta[key],value,"outdated release audit metadata: "+key);
}
assert.equal(meta.last_verified_release,version.version);
assert.equal(version.program_refactor.last_verified_release,version.version);
assert.equal(version.program_refactor.active_src_programs,debug.programs);
assert.equal(version.program_optimization.audited_src_programs,debug.programs);
assert.equal(version.program_optimization.pwa_cache,version.pwa_cache_revision);
assert.equal(meta.deployment_gate,false,"branch-based Pages is not gated by this workflow");
assert.equal(debug.problems.length,0,"runtime issues");
assert.equal(version.save_compatible,true);
console.log("release audit metadata OK: "+debug.loaded+" programs, "+debug.audits+" audits, "+debug.stateful_passed+" stateful tests; deployment caveat accurately recorded");
