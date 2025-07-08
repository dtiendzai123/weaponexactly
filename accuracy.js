// == Enhanced Vector3 + Advanced Kalman Filter ==
class Vector3 {
  constructor(x = 0, y = 0, z = 0) { this.x = x; this.y = y; this.z = z; }
  add(v) { return new Vector3(this.x + v.x, this.y + v.y, this.z + v.z); }
  subtract(v) { return new Vector3(this.x - v.x, this.y - v.y, this.z - v.z); }
  multiplyScalar(s) { return new Vector3(this.x * s, this.y * s, this.z * s); }
  length() { return Math.sqrt(this.x ** 2 + this.y ** 2 + this.z ** 2); }
  normalize() {
    const len = this.length();
    return len > 0 ? this.multiplyScalar(1 / len) : new Vector3();
  }
  clone() { return new Vector3(this.x, this.y, this.z); }
  dot(v) { return this.x * v.x + this.y * v.y + this.z * v.z; }
  lerp(v, t) {
    return new Vector3(
      this.x + (v.x - this.x) * t,
      this.y + (v.y - this.y) * t,
      this.z + (v.z - this.z) * t
    );
  }
  static zero() { return new Vector3(0, 0, 0); }
}

class AdvancedKalmanFilter {
  constructor(R = 0.008, Q = 0.000005) {
    this.R = R;
    this.Q = Q;
    this.A = 1;
    this.C = 1;
    this.cov = NaN;
    this.x = NaN;
    this.adaptiveQ = Q;
    this.innovationHistory = [];
  }

  adaptiveFilter(z) {
    if (this.innovationHistory.length > 10) {
      const avgInnovation = this.innovationHistory.reduce((a, b) => a + Math.abs(b), 0) / this.innovationHistory.length;
      this.adaptiveQ = this.Q * (1 + avgInnovation * 10);
      this.innovationHistory.shift();
    }

    if (isNaN(this.x)) {
      this.x = z;
      this.cov = this.R;
    } else {
      const predX = this.A * this.x;
      const predCov = this.cov + this.adaptiveQ;
      const K = predCov * this.C / (this.C * predCov * this.C + this.R);
      const innovation = z - this.C * predX;

      this.innovationHistory.push(innovation);
      this.x = predX + K * innovation;
      this.cov = predCov - K * this.C * predCov;
    }
    return this.x;
  }
}

// == Enhanced Weapon Profiles ==
const WeaponProfiles = {
  "AK47": { recoilSmooth: 0.98, dragSensitivity: 2.2, aimLockStrength: 1.3, accuracyBoost: 1.8, lockRadius: 0.08 },
  "M4A1": { recoilSmooth: 0.99, dragSensitivity: 2.3, aimLockStrength: 1.4, accuracyBoost: 1.85, lockRadius: 0.09 },
  "SCAR": { recoilSmooth: 0.97, dragSensitivity: 2.1, aimLockStrength: 1.35, accuracyBoost: 1.75, lockRadius: 0.08 },
  "FAMAS": { recoilSmooth: 0.95, dragSensitivity: 2.0, aimLockStrength: 1.25, accuracyBoost: 1.7, lockRadius: 0.075 },
  "GROZA": { recoilSmooth: 0.98, dragSensitivity: 1.9, aimLockStrength: 1.45, accuracyBoost: 1.9, lockRadius: 0.085 },
  "AN94": { recoilSmooth: 0.96, dragSensitivity: 2.0, aimLockStrength: 1.3, accuracyBoost: 1.75, lockRadius: 0.08 },
  "XM8": { recoilSmooth: 0.98, dragSensitivity: 1.95, aimLockStrength: 1.35, accuracyBoost: 1.8, lockRadius: 0.08 },

  "MP40": { recoilSmooth: 0.92, dragSensitivity: 2.5, aimLockStrength: 1.2, accuracyBoost: 1.6, lockRadius: 0.1 },
  "UMP": { recoilSmooth: 0.94, dragSensitivity: 2.4, aimLockStrength: 1.35, accuracyBoost: 2.2, lockRadius: 0.1 },
  "P90": { recoilSmooth: 0.95, dragSensitivity: 2.3, aimLockStrength: 1.3, accuracyBoost: 1.7, lockRadius: 0.095 },
  "MP5": { recoilSmooth: 0.96, dragSensitivity: 2.2, aimLockStrength: 1.35, accuracyBoost: 1.75, lockRadius: 0.09 },
  "THOMPSON": { recoilSmooth: 0.93, dragSensitivity: 2.3, aimLockStrength: 1.3, accuracyBoost: 1.65, lockRadius: 0.1 },

  "AWM": { recoilSmooth: 0.995, dragSensitivity: 1.8, aimLockStrength: 1.8, accuracyBoost: 2.5, lockRadius: 0.06 },
  "KAR98K": { recoilSmooth: 0.99, dragSensitivity: 1.75, aimLockStrength: 1.6, accuracyBoost: 2.2, lockRadius: 0.065 },
  "M82B": { recoilSmooth: 0.995, dragSensitivity: 1.8, aimLockStrength: 1.7, accuracyBoost: 2.4, lockRadius: 0.06 },

  "M1014": { recoilSmooth: 0.88, dragSensitivity: 2.0, aimLockStrength: 1.1, accuracyBoost: 1.5, lockRadius: 0.12 },
  "SPAS12": { recoilSmooth: 0.9, dragSensitivity: 2.0, aimLockStrength: 1.2, accuracyBoost: 1.6, lockRadius: 0.12 },
  "MAG7": { recoilSmooth: 0.91, dragSensitivity: 2.1, aimLockStrength: 1.25, accuracyBoost: 1.65, lockRadius: 0.11 },
  "M1887": { recoilSmooth: 0.85, dragSensitivity: 2.5, aimLockStrength: 1.5, accuracyBoost: 2.5, lockRadius: 0.15 },

  "M249": { recoilSmooth: 0.93, dragSensitivity: 2.0, aimLockStrength: 1.4, accuracyBoost: 1.8, lockRadius: 0.085 },
  "GATLING": { recoilSmooth: 0.91, dragSensitivity: 2.1, aimLockStrength: 1.35, accuracyBoost: 1.7, lockRadius: 0.09 },

  "DESERT_EAGLE": { recoilSmooth: 0.97, dragSensitivity: 2.2, aimLockStrength: 1.5, accuracyBoost: 2.0, lockRadius: 0.08 },
  "M500": { recoilSmooth: 0.93, dragSensitivity: 2.3, aimLockStrength: 1.4, accuracyBoost: 1.8, lockRadius: 0.08 },
  "G18": { recoilSmooth: 0.91, dragSensitivity: 2.4, aimLockStrength: 1.3, accuracyBoost: 1.7, lockRadius: 0.09 },

  "DEFAULT": { recoilSmooth: 0.94, dragSensitivity: 2.0, aimLockStrength: 1.3, accuracyBoost: 1.7, lockRadius: 0.08 }
};

// == Enhanced Dynamic Sensitivity with Prediction ==

// == Enhanced Dynamic Sensitivity with Prediction ==
function getAdvancedDragSensitivity(currentAim, targetPos, velocity, profile, baseSensitivity = 1.0) {
  const dx = currentAim.x - targetPos.x;
  const dy = currentAim.y - targetPos.y;
  const dz = currentAim.z - targetPos.z;
  const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

  const maxRadius = profile.lockRadius || 0.08;
  const distanceFactor = Math.max(0.1, 1 - (dist / maxRadius));

  const velocityMagnitude = velocity.length();
  const velocityFactor = 1 + (velocityMagnitude * 0.5);

  const weaponSensitivity = profile.dragSensitivity || 2.0;

  return baseSensitivity * weaponSensitivity * distanceFactor * velocityFactor;
}

// == Enhanced Aim Lock System ==
class AimLockUltimate {
  constructor(currentWeapon = "DEFAULT") {
    this.profile = WeaponProfiles[currentWeapon] || WeaponProfiles["DEFAULT"];
    this.weapon = currentWeapon;

    this.kalman = {
      x: new AdvancedKalmanFilter(0.005, 0.000002),
      y: new AdvancedKalmanFilter(0.005, 0.000002),
      z: new AdvancedKalmanFilter(0.005, 0.000002)
    };

    this.prevPos = null;
    this.velocity = Vector3.zero();
    this.acceleration = Vector3.zero();
    this.recoilOffset = Vector3.zero();
    this.lastUpdate = Date.now();
    this.lockHistory = [];
    this.currentAim = Vector3.zero();

    this.predictionTime = 0.05;
    this.smoothingFactor = 0.15;
    this.lockConfidence = 0.0;
  }

  updateEnemyPosition(rawPos) {
    const now = Date.now();
    const dt = Math.min((now - this.lastUpdate) / 1000, 0.1);

    if (this.prevPos && dt > 0) {
      const newVelocity = rawPos.subtract(this.prevPos).multiplyScalar(1 / dt);
      const newAcceleration = newVelocity.subtract(this.velocity).multiplyScalar(1 / dt);

      this.velocity = this.velocity.lerp(newVelocity, 0.3);
      this.acceleration = this.acceleration.lerp(newAcceleration, 0.2);
    }

    this.prevPos = rawPos.clone();
    this.lastUpdate = now;

    const filtered = new Vector3(
      this.kalman.x.adaptiveFilter(rawPos.x),
      this.kalman.y.adaptiveFilter(rawPos.y),
      this.kalman.z.adaptiveFilter(rawPos.z)
    );

    return filtered;
  }

  predictPosition(filteredPos) {
    const velocityPrediction = this.velocity.multiplyScalar(this.predictionTime);
    const accelerationPrediction = this.acceleration.multiplyScalar(0.5 * this.predictionTime * this.predictionTime);
    return filteredPos.add(velocityPrediction).add(accelerationPrediction);
  }

  applyAdvancedRecoilCompensation(recoilOffset) {
    const smoothing = this.profile.recoilSmooth || 0.9;
    const strength = this.profile.aimLockStrength || 1.0;
    const compensated = recoilOffset.multiplyScalar(strength);
    this.recoilOffset = this.recoilOffset.multiplyScalar(smoothing).add(compensated.multiplyScalar(1 - smoothing));
  }

  calculateLockConfidence(currentAim, targetPos) {
    const distance = currentAim.subtract(targetPos).length();
    const maxDistance = this.profile.lockRadius || 0.08;
    this.lockConfidence = Math.max(0, 1 - (distance / maxDistance));
    return this.lockConfidence;
  }

  dragAndLockHead(predictedPos, currentAim) {
    const sensitivity = getAdvancedDragSensitivity(currentAim, predictedPos, this.velocity, this.profile);
    const targetDelta = predictedPos.subtract(this.recoilOffset).subtract(currentAim);
    const adjustedDelta = targetDelta.multiplyScalar(sensitivity * this.smoothingFactor);
    const accuracyBoost = this.profile.accuracyBoost || 1.0;
    const finalAim = currentAim.add(adjustedDelta).multiplyScalar(accuracyBoost);
    this.currentAim = finalAim;
    this.setCrosshair(finalAim);
    return finalAim;
  }

  setCrosshair(vec3) {
    console.log(`🎯 [${this.weapon}] Locking Aim: ${vec3.x.toFixed(6)}, ${vec3.y.toFixed(6)}, ${vec3.z.toFixed(6)} | Confidence: ${(this.lockConfidence * 100).toFixed(1)}%`);
    // GameAPI.setAim(vec3.x, vec3.y, vec3.z);
  }

  update(enemyHeadPos, recoilOffset, currentAim) {
    this.currentAim = currentAim;

    const filteredPos = this.updateEnemyPosition(enemyHeadPos);
    const predictedPos = this.predictPosition(filteredPos);
    this.applyAdvancedRecoilCompensation(recoilOffset);
    this.calculateLockConfidence(currentAim, predictedPos);
    const newAim = this.dragAndLockHead(predictedPos, currentAim);

    this.lockHistory.push({
      timestamp: Date.now(),
      confidence: this.lockConfidence,
      distance: currentAim.subtract(predictedPos).length()
    });

    if (this.lockHistory.length > 100) {
      this.lockHistory.shift();
    }

    return newAim;
  }

  getPerformanceStats() {
    if (this.lockHistory.length === 0) return null;

    const recent = this.lockHistory.slice(-20);
    const avgConfidence = recent.reduce((sum, h) => sum + h.confidence, 0) / recent.length;
    const avgDistance = recent.reduce((sum, h) => sum + h.distance, 0) / recent.length;

    return {
      avgConfidence: avgConfidence * 100,
      avgDistance: avgDistance * 1000,
      weapon: this.weapon,
      samples: recent.length
    };
  }
}

// == Enhanced Trigger System ==
function advancedTriggerLock(currentAim, targetPos, velocity, profile, baseThreshold = 0.003) {
  const dx = currentAim.x - targetPos.x;
  const dy = currentAim.y - targetPos.y;
  const dz = currentAim.z - targetPos.z;
  const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

  const weaponThreshold = baseThreshold * (profile.lockRadius || 1.0);
  const velocityMagnitude = velocity.length();
  const velocityAdjustment = 1 + (velocityMagnitude * 0.1);
  const adjustedThreshold = weaponThreshold * velocityAdjustment;

  return {
    shouldFire: dist <= adjustedThreshold,
    distance: dist,
    threshold: adjustedThreshold,
    confidence: Math.max(0, 1 - (dist / adjustedThreshold))
  };
}

// == Enhanced Usage Example ==

const boneHeadPos = new Vector3(-0.0456970781, -0.004478302, -0.0200432576);
const recoilOffset = new Vector3(0.0, 0.0, 0.0);
const currentAim = new Vector3(0.55, 0.12, -0.02);
const weaponsToTest = ["M1887", "MP40", "M1014", "UMP"];

function runInfiniteLoop() {
  for (const currentWeapon of weaponsToTest) {
    const enhancedAimSystem = new AimLockUltimate(currentWeapon);
    const newAim = enhancedAimSystem.update(boneHeadPos, recoilOffset, currentAim);

    const triggerResult = advancedTriggerLock(
      newAim,
      boneHeadPos,
      enhancedAimSystem.velocity,
      enhancedAimSystem.profile
    );

    if (triggerResult.shouldFire) {
      console.log(`🔥 FIRE - ${currentWeapon} | Confidence: ${(triggerResult.confidence * 100).toFixed(1)}% | Distance: ${(triggerResult.distance * 1000).toFixed(2)}mm`);
    } else {
      console.log(`🚫 NO FIRE - ${currentWeapon} | Distance: ${(triggerResult.distance * 1000).toFixed(2)}mm`);
    }

    const stats = enhancedAimSystem.getPerformanceStats();
    if (stats) {
      console.log(`📊 [${currentWeapon}] Confidence: ${stats.avgConfidence.toFixed(1)}%, Distance: ${stats.avgDistance.toFixed(2)}mm`);
    }

    console.log("----------------------------------------------------");
  }

  // 🔁 Lặp lại ngay lập tức không delay
  setTimeout(runInfiniteLoop, 0); // ⚠️ Không chặn main thread
}

// 🚀 Bắt đầu vòng lặp vô hạn
runInfiniteLoop();

// == Weapon Switching Function ==
function switchWeapon(newWeapon) {
  if (WeaponProfiles[newWeapon]) {
    const enhancedAimSystem = new AimLockUltimate(newWeapon);
    console.log(`🔫 Switched to ${newWeapon} - Profile loaded`);
    return enhancedAimSystem;
  } else {
    console.log(`❌ Unknown weapon: ${newWeapon}, using DEFAULT profile`);
    return new AimLockUltimate("DEFAULT");
  }
}

function detectOptimalSettingsForDistance(weapon, gameMode = "normal", distanceKey) {
  const baseProfile = WeaponProfiles[weapon] || WeaponProfiles["DEFAULT"];
  const modeMultipliers = {
    "normal": 1.0,
    "ranked": 1.2,
    "close_combat": 1.5,
    "long_range": 0.8
  };
  const distanceMultipliers = {
    close: 1.1,
    medium: 1.0,
    far: 0.9,
    veryFar: 0.8
  };

  const modeMultiplier = modeMultipliers[gameMode] || 1.0;
  const distanceMultiplier = distanceMultipliers[distanceKey] || 1.0;

  // Tổng multiplier áp dụng theo mode và distance
  const totalMultiplier = modeMultiplier * distanceMultiplier;

  return {
    ...baseProfile,
    dragSensitivity: baseProfile.dragSensitivity * totalMultiplier,
    aimLockStrength: baseProfile.aimLockStrength * totalMultiplier,
    accuracyBoost: baseProfile.accuracyBoost * totalMultiplier
  };
}

function getAllSettingsForWeapon(weapon) {
  const gameModes = ["normal", "ranked", "close_combat", "long_range"];
  const distanceKeys = ["close", "medium", "far", "veryFar"];

  const allSettings = {};

  gameModes.forEach(mode => {
    allSettings[mode] = {};
    distanceKeys.forEach(distance => {
      allSettings[mode][distance] = detectOptimalSettingsForDistance(weapon, mode, distance);
    });
  });

  return allSettings;
}
