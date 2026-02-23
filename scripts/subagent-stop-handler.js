#!/usr/bin/env node
/**
 * subagent-stop-handler.js
 * SubagentStop hook: 파이프라인 서브에이전트 종료 시 다음 단계 안내 출력
 */

let input = '';

process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => { input += chunk; });
process.stdin.on('end', () => {
  try {
    const event = JSON.parse(input);

    // 종료된 에이전트 이름 추출
    const agentName = event?.agent_name || event?.agent_type || '';

    if (!agentName) {
      process.exit(0);
    }

    const normalized = agentName.toLowerCase();

    // 파이프라인 에이전트별 다음 단계 안내
    const agentMessages = {
      'prd-writer': 'prd-writer 에이전트가 완료되었습니다.\ngate-keeper 검증이 필요합니다. gate-keeper 에이전트를 실행하여 PRD 산출물을 검증하세요.',
      'design-writer': 'design-writer 에이전트가 완료되었습니다.\ngate-keeper 검증이 필요합니다. gate-keeper 에이전트를 실행하여 DESIGN 산출물을 검증하세요.',
      'task-writer': 'task-writer 에이전트가 완료되었습니다.\ngate-keeper 검증이 필요합니다. gate-keeper 에이전트를 실행하여 TASK 산출물을 검증하세요.',
      'code-writer': 'code-writer 에이전트가 완료되었습니다.\ngate-keeper 검증이 필요합니다. gate-keeper 에이전트를 실행하여 CODE/PR 산출물을 검증하세요.',
      'code-reviewer': 'code-reviewer 에이전트가 완료되었습니다.\n코드 리뷰 보고서를 확인하고, 사람 리뷰어에게 최종 승인을 요청하세요.',
      'release-manager': 'release-manager 에이전트가 완료되었습니다.\ngate-keeper 검증이 필요합니다. gate-keeper 에이전트를 실행하여 RELEASE 산출물을 검증하세요.',
    };

    let message = null;
    for (const [key, msg] of Object.entries(agentMessages)) {
      if (normalized.includes(key)) {
        message = msg;
        break;
      }
    }

    if (!message) {
      process.exit(0);
    }

    const output = {
      additionalContext: message
    };

    process.stdout.write(JSON.stringify(output));
    process.exit(0);
  } catch (err) {
    // 파싱 오류 시 조용히 종료
    process.exit(0);
  }
});
