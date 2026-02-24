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
        message = `${key} 에이전트가 종료되었다. 에이전트 보고서를 읽고 결과를 사용자에게 요약하여 알려라. 정상 완료된 경우 gate-keeper 에이전트를 실행하여 ${target} 산출물을 검증할 것을 제안하라. 에이전트가 오류를 보고했으면 보고서 내용에 따라 조치 방법을 안내하라.`;
        break;
      }
    }

    if (!message && match('gate-keeper')) {
      message = 'gate-keeper 에이전트가 종료되었다. 게이트 검증 보고서를 읽고 판정 결과를 사용자에게 요약하여 알려라. 통과면 다음 단계 진행을 제안하고, 실패면 재작업이 필요한 에이전트와 수정 항목을 안내하라.';
    }

    if (!message && match('local-runner')) {
      message = 'local-runner 에이전트가 종료되었다. 로컬 테스트 환경 보고서를 읽고 결과를 사용자에게 요약하여 알려라. 테스트가 완료되면 파이프라인이 종료됨을 안내하라.';
    }

    if (!message) { process.exit(0); }

    process.stdout.write(JSON.stringify({ decision: 'approve', systemMessage: message }));
    process.exit(0);
  } catch (err) {
    process.stderr.write(`[subagent-stop-handler] error: ${err.message}\n`);
    process.exit(0);
  }
});
