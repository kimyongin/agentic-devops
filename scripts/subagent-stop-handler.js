#!/usr/bin/env node
/**
 * subagent-stop-handler.js
 * SubagentStop hook: 파이프라인 서브에이전트 종료 시 다음 단계 안내 출력
 */

let input = '';

process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => { input += chunk; });
process.stdin.on('end', () => {
  const fs = require('fs');
  const path = require('path');
  const logFile = path.join(__dirname, '..', 'hook-debug.log');
  fs.appendFileSync(logFile, `[${new Date().toISOString()}] ${input}\n`);

  try {
    const event = JSON.parse(input);
    const agentType = (event?.agent_type || '').toLowerCase();
    if (!agentType) { process.exit(0); }

    const match = (name) => agentType === name || agentType.endsWith(name);

    // gate-keeper 검증이 필요한 에이전트 → 산출물 유형 매핑
    const gateTargets = {
      'prd-writer': 'PRD',
      'design-writer': 'DESIGN',
      'task-writer': 'TASK',
      'code-writer': 'CODE',
      'code-reviewer': 'REVIEW',
    };

    let message = null;

    for (const [key, target] of Object.entries(gateTargets)) {
      if (match(key)) {
        message = `${key} 에이전트가 완료되었습니다.\n에이전트 보고서를 확인하고, 정상 완료된 경우 gate-keeper 에이전트를 실행하여 ${target} 산출물을 검증하세요. 에이전트가 오류를 보고했으면 보고서 내용에 따라 조치하세요.`;
        break;
      }
    }

    if (!message && match('gate-keeper')) {
      message = 'gate-keeper 에이전트가 완료되었습니다.\n게이트 검증 보고서를 확인하세요. 통과인 경우 다음 단계를 진행하고, 실패인 경우 보고서에 따라 해당 에이전트를 재실행하세요.';
    }

    if (!message && match('local-runner')) {
      message = 'local-runner 에이전트가 완료되었습니다.\n로컬 테스트 환경 보고서를 확인하세요. 테스트 완료 후 "테스트 완료"를 전달하면 파이프라인이 완료됩니다.';
    }

    if (!message) { process.exit(0); }

    process.stdout.write(JSON.stringify({ decision: 'approve', systemMessage: message }));
    process.exit(0);
  } catch (err) {
    process.stderr.write(`[subagent-stop-handler] error: ${err.message}\n`);
    process.exit(0);
  }
});
