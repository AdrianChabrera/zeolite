import type { Node } from '@xyflow/react';

export function getNodeCenter(node: Node) {
  return {
    x: node.position.x + (node.measured?.width ?? 100) / 2,
    y: node.position.y + (node.measured?.height ?? 40) / 2,
  };
}

export function getEdgeParams(source: Node, target: Node) {
  const sx = source.position.x + (source.measured?.width  ?? 100) / 2;
  const sy = source.position.y + (source.measured?.height ?? 40)  / 2;
  const tx = target.position.x + (target.measured?.width  ?? 100) / 2;
  const ty = target.position.y + (target.measured?.height ?? 40)  / 2;

  const dx = tx - sx;
  const dy = ty - sy;
  const angle = Math.atan2(dy, dx);

  const sw = (source.measured?.width  ?? 100) / 2;
  const sh = (source.measured?.height ?? 40)  / 2;
  const tw = (target.measured?.width  ?? 100) / 2;
  const th = (target.measured?.height ?? 40)  / 2;

  const scaleS = Math.min(
    Math.abs(sw / Math.cos(angle)),
    Math.abs(sh / Math.sin(angle))
  );
  const sourceX = sx + Math.cos(angle) * scaleS;
  const sourceY = sy + Math.sin(angle) * scaleS;

  const angleBack = angle + Math.PI;
  const scaleT = Math.min(
    Math.abs(tw / Math.cos(angleBack)),
    Math.abs(th / Math.sin(angleBack))
  );
  const targetX = tx + Math.cos(angleBack) * scaleT;
  const targetY = ty + Math.sin(angleBack) * scaleT;

  return { sourceX, sourceY, targetX, targetY };
}