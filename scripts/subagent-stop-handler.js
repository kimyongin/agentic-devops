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
    const agentName = (event?.agent_name || event?.agent_type || '').toLowerCase();
    if (!agentName) process.exit(0);

    // gate-keeper 검증이 필요한 에이전트 → 산출물 유형 매핑
    const gateTargets = {
      'prd-writer': 'PRD',
      'design-writer': 'DESIGN',
      'task-writer': 'TASK',
      'code-writer': 'CODE/PR',
      'release-manager': 'RELEASE',
    };

    let message = null;

    for (const [key, target] of Object.entries(gateTargets)) {
      if (agentName.includes(key)) {
        message = `${key} 에이전트가 완료되었습니다.\ngate-keeper 검증이 필요합니다. gate-keeper 에이전트를 실행하여 ${target} 산출물을 검증하세요.`;
        break;
      }
    }

    if (!message && agentName.includes('code-reviewer')) {
      message = 'code-reviewer 에이전트가 완료되었습니다.\n코드 리뷰 보고서를 확인하고, 사람 리뷰어에게 최종 승인을 요청하세요.';
    }

    if (!message && agentName.includes('local-runner')) {
      message = 'local-runner 에이전트가 완료되었습니다.\n로컬 테스트 환경 보고서를 확인하세요. 테스트 완료 후 "테스트 완료"를 전달하면 PR 머지 단계로 진행합니다.';
    }

    if (!message) process.exit(0);

    process.stdout.write(JSON.stringify({ additionalContext: message }));
    process.exit(0);
  } catch (err) {
    process.exit(0);
  }
});
