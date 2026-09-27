#!/usr/bin/env node
"use strict";
const fs=require("fs"),cp=require("child_process");
const before=process.env.GITHUB_EVENT_BEFORE||"";
const after=process.env.GITHUB_SHA||"HEAD";
const run=cmd=>cp.execSync(cmd,{encoding:"utf8"}).trim();
let names=[];
try { const range=before && !/^0+$/.test(before) ? before+" "+after : after+"^ "+after; names=run("git diff --name-only "+range).split("\n").filter(Boolean); } catch(e) {}
const appChanges=names.filter(p=>/^(src\/|js\/|owner\/|android\/|app\/)/.test(p));
const architectureChanges=names.filter(p=>/^(automation\/|\.github\/workflows\/|STAGE_|PRODUCTION_|PACIFIC_EDUCATION_MASTER|PACIFIC_GUARDIAN)/.test(p));
const record={recordType:"PACIFIC_GUARDIAN_APP_ARCHITECTURE_CHANGE_AUDIT",version:"1.0.0",recordedAt:new Date().toISOString(),repository:process.env.GITHUB_REPOSITORY||"",commit:after,beforeCommit:before,actor:process.env.GITHUB_ACTOR||"",workflowRun:process.env.GITHUB_RUN_ID||"",appChanges,architectureChanges,changeRequired:true,architectureTraceabilityRequired:appChanges.length>0,status:appChanges.length>0?"TRACEABILITY_RECORD_REQUIRED":"NO_APP_CHANGE"};
fs.mkdirSync("automation/change-audit",{recursive:true});
fs.writeFileSync("automation/change-audit/"+(process.env.GITHUB_RUN_ID||Date.now())+".json",JSON.stringify(record,null,2)+"\n");
console.log(JSON.stringify(record));
