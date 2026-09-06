const assert = require('assert');

console.log("=== Running FaceVision Proctoring Test Suite ===");

function extractGeometricDescriptor(landmarks) {
  if (!landmarks || landmarks.length < 468) {
    return new Array(16).fill(0);
  }

  const dist = (i, j) => {
    const p1 = landmarks[i];
    const p2 = landmarks[j];
    if (!p1 || !p2) return 0;
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const forehead = 10;
  const chin = 152;
  const leftCheek = 234;
  const rightCheek = 454;
  const leftOuterEye = 33;
  const rightOuterEye = 263;
  const leftInnerEye = 133;
  const rightInnerEye = 362;
  const glabella = 168;
  const noseTip = 1;
  const leftMouth = 61;
  const rightMouth = 291;
  const upperLip = 0;
  const lowerLip = 17;
  const noseLeft = 102;
  const noseRight = 331;
  const jawLeft = 172;
  const jawRight = 397;

  const faceH = Math.max(1e-4, dist(forehead, chin));
  const faceW = Math.max(1e-4, dist(leftCheek, rightCheek));

  const vector = [
    dist(leftOuterEye, rightOuterEye) / faceW,
    dist(leftInnerEye, rightInnerEye) / faceW,
    dist(forehead, glabella) / faceH,
    dist(glabella, noseTip) / faceH,
    dist(noseTip, chin) / faceH,
    dist(leftMouth, rightMouth) / faceW,
    dist(upperLip, lowerLip) / faceH,
    dist(noseLeft, noseRight) / faceW,
    dist(noseTip, leftMouth) / faceH,
    dist(noseTip, rightMouth) / faceH,
    dist(leftOuterEye, noseTip) / faceH,
    dist(rightOuterEye, noseTip) / faceH,
    dist(jawLeft, jawRight) / faceW,
    dist(glabella, chin) / faceH,
    faceH / faceW,
    dist(leftInnerEye, glabella) / Math.max(1e-4, dist(rightInnerEye, glabella)),
  ];

  return vector.map((v) => Number(v.toFixed(4)));
}

function calculateGeometricSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length || vecA.length === 0) return 0;
  let totalRelativeDiff = 0;
  for (let i = 0; i < vecA.length; i++) {
    const mean = Math.max(1e-4, (Math.abs(vecA[i]) + Math.abs(vecB[i])) / 2);
    totalRelativeDiff += Math.abs(vecA[i] - vecB[i]) / mean;
  }
  const avgError = totalRelativeDiff / vecA.length;
  return Math.max(0, Math.min(1, 1 - avgError * 3.2));
}

// Test 1: Empty landmarks test
console.log("Test 1: Empty / null landmarks test");
const emptyVec = extractGeometricDescriptor([]);
assert.strictEqual(emptyVec.length, 16);
assert.strictEqual(emptyVec.every(v => v === 0), true);
console.log("✓ Empty landmarks properly rejected");

// Test 2: Synthesize Candidate A (Standard face)
console.log("\nTest 2: Biometric Descriptor for Candidate A");
const landmarksA = new Array(478).fill(null).map(() => ({ x: 0.5, y: 0.5, z: 0 }));
landmarksA[10] = { x: 0.50, y: 0.15, z: 0 };  // forehead
landmarksA[152] = { x: 0.50, y: 0.85, z: 0 }; // chin
landmarksA[234] = { x: 0.25, y: 0.50, z: 0 }; // left cheek
landmarksA[454] = { x: 0.75, y: 0.50, z: 0 }; // right cheek
landmarksA[33] = { x: 0.35, y: 0.35, z: 0 };  // left outer eye
landmarksA[263] = { x: 0.65, y: 0.35, z: 0 }; // right outer eye
landmarksA[133] = { x: 0.42, y: 0.35, z: 0 }; // left inner eye
landmarksA[362] = { x: 0.58, y: 0.35, z: 0 }; // right inner eye
landmarksA[168] = { x: 0.50, y: 0.35, z: 0 }; // glabella
landmarksA[1] = { x: 0.50, y: 0.55, z: 0 };   // nose tip
landmarksA[61] = { x: 0.40, y: 0.70, z: 0 };  // left mouth
landmarksA[291] = { x: 0.60, y: 0.70, z: 0 }; // right mouth
landmarksA[0] = { x: 0.50, y: 0.68, z: 0 };   // upper lip
landmarksA[17] = { x: 0.50, y: 0.72, z: 0 };  // lower lip
landmarksA[102] = { x: 0.45, y: 0.55, z: 0 }; // nose left
landmarksA[331] = { x: 0.55, y: 0.55, z: 0 }; // nose right
landmarksA[172] = { x: 0.30, y: 0.75, z: 0 }; // jaw left
landmarksA[397] = { x: 0.70, y: 0.75, z: 0 }; // jaw right

const descA = extractGeometricDescriptor(landmarksA);
assert.strictEqual(descA.length, 16);
console.log("✓ Candidate A invariant geometric ratios:", descA);

// Test 3: Same Candidate with micro-movements
console.log("\nTest 3: Same Candidate A verification test");
const landmarksA2 = landmarksA.map(pt => ({
  x: pt.x + (Math.random() - 0.5) * 0.005,
  y: pt.y + (Math.random() - 0.5) * 0.005,
  z: 0
}));
const descA2 = extractGeometricDescriptor(landmarksA2);
const simSame = calculateGeometricSimilarity(descA, descA2);
console.log("Same candidate geometric similarity:", simSame.toFixed(4));
assert(simSame >= 0.95, "Same person should match with >= 0.95 similarity");
console.log("✓ Same candidate identity verified with score:", simSame.toFixed(4));

// Test 4: Different Candidate B (Different facial geometry / Impersonator)
console.log("\nTest 4: Impersonator Detection Test (Candidate B)");
const landmarksB = JSON.parse(JSON.stringify(landmarksA));
// Candidate B has wider outer eyes, shorter chin, narrower mouth, different proportions
landmarksB[33] = { x: 0.28, y: 0.35, z: 0 };
landmarksB[263] = { x: 0.72, y: 0.35, z: 0 };
landmarksB[152] = { x: 0.50, y: 0.70, z: 0 };
landmarksB[61] = { x: 0.46, y: 0.62, z: 0 };
landmarksB[291] = { x: 0.54, y: 0.62, z: 0 };
landmarksB[10] = { x: 0.50, y: 0.25, z: 0 };

const descB = extractGeometricDescriptor(landmarksB);
const simDiff = calculateGeometricSimilarity(descA, descB);
console.log("Different candidate similarity score:", simDiff.toFixed(4));
assert(simDiff < 0.45, "Different person geometric proportions must be < 0.45");
console.log("✓ Impersonator clearly rejected with score:", simDiff.toFixed(4));

// Test 5: Head Pose / Gaze Yaw & Pitch Calculation
console.log("\nTest 5: Head Pose / Looking Away Detection");
function computePose(nose, leftEye, rightEye, forehead, chin) {
  const dLeft = nose.x - leftEye.x;
  const dRight = rightEye.x - nose.x;
  const yaw = (dLeft - dRight) / (Math.abs(dLeft) + Math.abs(dRight) + 1e-4);

  const dUp = nose.y - forehead.y;
  const dDown = chin.y - nose.y;
  const pitch = (dUp - dDown) / (Math.abs(dUp) + Math.abs(dDown) + 1e-4);

  return { yaw, pitch };
}

const forwardPose = computePose(landmarksA[1], landmarksA[33], landmarksA[263], landmarksA[10], landmarksA[152]);
console.log("Facing forward pose:", forwardPose);
assert(Math.abs(forwardPose.yaw) < 0.15, "Forward yaw should be near 0");

const turnedNose = { x: 0.62, y: 0.55, z: 0 };
const turnedPose = computePose(turnedNose, landmarksA[33], landmarksA[263], landmarksA[10], landmarksA[152]);
console.log("Turned head pose:", turnedPose);
assert(Math.abs(turnedPose.yaw) > 0.35, "Turned head should trigger yaw > 0.35 (Looking Away)");
console.log("✓ Looking Away correctly detected with yaw =", turnedPose.yaw.toFixed(3));

console.log("\n=== ALL BIOMETRIC & COMPUTER VISION TESTS PASSED SUCCESSFULLY! ===");
