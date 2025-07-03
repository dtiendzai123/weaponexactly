// == Vector3 + Kalman Filter ==
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
  static zero() { return new Vector3(0, 0, 0); }
}

class KalmanFilter {
  constructor(R = 0.01, Q = 0.0001) {
    this.R = R; this.Q = Q; this.A = 1; this.C = 1;
    this.cov = NaN; this.x = NaN;
  }

  filter(z) {
    if (isNaN(this.x)) {
      this.x = z; this.cov = this.R;
    } else {
      const predX = this.A * this.x;
      const predCov = this.cov + this.Q;
      const K = predCov * this.C / (this.C * predCov * this.C + this.R);
      this.x = predX + K * (z - this.C * predX);
      this.cov = predCov - K * this.C * predCov;
    }
    return this.x;
  }
}

// == Weapon Profiles ==

const WeaponProfiles = {
  // Assault Rifles (AR)
  "AK47":        { recoilSmooth: 0.95, dragSensitivity: 1.7,  aimLockStrength: 1.0, accuracyBoost: 1.4 },
  "M4A1":        { recoilSmooth: 0.98, dragSensitivity: 1.8,  aimLockStrength: 1.0, accuracyBoost: 1.45 },
  "SCAR":        { recoilSmooth: 0.96, dragSensitivity: 1.75, aimLockStrength: 1.0, accuracyBoost: 1.45 },
  "FAMAS":       { recoilSmooth: 0.92, dragSensitivity: 1.7,  aimLockStrength: 0.95, accuracyBoost: 1.4 },
  "GROZA":       { recoilSmooth: 0.97, dragSensitivity: 1.6,  aimLockStrength: 1.1, accuracyBoost: 1.5 },
  "AN94":        { recoilSmooth: 0.95, dragSensitivity: 1.7,  aimLockStrength: 1.0, accuracyBoost: 1.4 },
  "XM8":         { recoilSmooth: 0.97, dragSensitivity: 1.65, aimLockStrength: 1.0, accuracyBoost: 1.45 },

  // Submachine Guns (SMG)
  "MP40":        { recoilSmooth: 0.9,  dragSensitivity: 2.0,  aimLockStrength: 0.9, accuracyBoost: 1.35 },
  "UMP":         { recoilSmooth: 0.92, dragSensitivity: 1.9,  aimLockStrength: 1.0, accuracyBoost: 2.0 },
  "P90":         { recoilSmooth: 0.93, dragSensitivity: 1.9,  aimLockStrength: 0.95, accuracyBoost: 1.4 },
  "MP5":         { recoilSmooth: 0.94, dragSensitivity: 1.85, aimLockStrength: 1.0, accuracyBoost: 1.4 },
  "THOMPSON":    { recoilSmooth: 0.91, dragSensitivity: 1.9,  aimLockStrength: 1.0, accuracyBoost: 1.35 },

  // Sniper Rifles (SR)
  "AWM":         { recoilSmooth: 0.98, dragSensitivity: 1.5,  aimLockStrength: 1.2, accuracyBoost: 1.5 },
  "KAR98K":      { recoilSmooth: 0.97, dragSensitivity: 1.45, aimLockStrength: 1.1, accuracyBoost: 1.45 },
  "M82B":        { recoilSmooth: 0.97, dragSensitivity: 1.5,  aimLockStrength: 1.15, accuracyBoost: 1.5 },

  // Shotguns
  "M1014":       { recoilSmooth: 0.85, dragSensitivity: 1.6,  aimLockStrength: 0.75, accuracyBoost: 1.2 },
  "SPAS12":      { recoilSmooth: 0.87, dragSensitivity: 1.6,  aimLockStrength: 0.8,  accuracyBoost: 1.25 },
  "MAG7":        { recoilSmooth: 0.88, dragSensitivity: 1.65, aimLockStrength: 0.85, accuracyBoost: 1.25 },

 "M1887":        { recoilSmooth: 0.88, dragSensitivity: 1.65, aimLockStrength: 0.85, accuracyBoost: 1.25 },

  // Light Machine Guns (LMG)
  "M249":        { recoilSmooth: 0.9,  dragSensitivity: 1.7,  aimLockStrength: 1.0, accuracyBoost: 1.4 },
  "GATLING":     { recoilSmooth: 0.88, dragSensitivity: 1.75, aimLockStrength: 0.95, accuracyBoost: 1.35 },

  // Pistols / Sidearms
  "DESERT_EAGLE":{ recoilSmooth: 0.95, dragSensitivity: 1.75, aimLockStrength: 1.1, accuracyBoost: 1.5 },
  "M500":         { recoilSmooth: 0.9,  dragSensitivity: 1.8,  aimLockStrength: 1.0, accuracyBoost: 1.4 },
  "G18":         { recoilSmooth: 0.88, dragSensitivity: 1.85, aimLockStrength: 0.9, accuracyBoost: 1.35 },

  // Default fallback
  "DEFAULT":     { recoilSmooth: 0.9,  dragSensitivity: 1.6,  aimLockStrength: 1.0, accuracyBoost: 1.4 }
};

function getDragSensitivity(currentAim, boneHead, baseSensitivity = 1.0, maxSensitivity = 2.0, triggerRadius = 0.05) {
  const dx = currentAim.x - boneHead.x;
  const dy = currentAim.y - boneHead.y;
  const dz = currentAim.z - boneHead.z;
  const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

  if (dist <= triggerRadius) {
    const factor = 1 + (maxSensitivity - 1) * (1 - dist / triggerRadius);
    return baseSensitivity * factor;
  }
  return baseSensitivity;
}

// Trong hàm update hoặc drag aim
function updateAim(currentAim, boneHead, currentWeapon) {
  const profile = weaponProfiles[currentWeapon] || { dragSensitivity: 1.0 };

  // Tính sensitivity cơ bản lấy từ weapon profile
  const baseSensitivity = profile.dragSensitivity;

  // Tính sensitivity điều chỉnh theo khoảng cách tới bone head
  const sensitivity = getDragSensitivity(currentAim, boneHead, baseSensitivity, 2.0, 0.05);

  // Tính delta drag
  const deltaX = boneHead.x - currentAim.x;
  const deltaY = boneHead.y - currentAim.y;
  const deltaZ = boneHead.z - currentAim.z;

  // Áp dụng sensitivity
  const adjustedDeltaX = deltaX * sensitivity;
  const adjustedDeltaY = deltaY * sensitivity;
  const adjustedDeltaZ = deltaZ * sensitivity;

  // Cập nhật tâm ngắm mới
  const newAim = {
    x: currentAim.x + adjustedDeltaX,
    y: currentAim.y + adjustedDeltaY,
    z: currentAim.z + adjustedDeltaZ
  };

  setAim(newAim.x, newAim.y, newAim.z);
}

// == AimLock for All Weapons ==
class AimLockUltimate {
  constructor(currentWeapon = "DEFAULT") {
    const profile = WeaponProfiles[currentWeapon] || WeaponProfiles["DEFAULT"];
    this.profile = profile;

    this.kalman = {
      x: new KalmanFilter(0.05, 0.00001),
      y: new KalmanFilter(0.05, 0.00001),
      z: new KalmanFilter(0.05, 0.00001)
    };
    this.prevPos = null;
    this.velocity = Vector3.zero();
    this.recoilOffset = Vector3.zero();
    this.lastUpdate = Date.now();
  }

  updateEnemyPosition(currentPos) {
    const now = Date.now();
    const dt = (now - this.lastUpdate) / 1000;
    if (this.prevPos && dt > 0) {
      const velocity = currentPos.subtract(this.prevPos).multiplyScalar(1 / dt);
      this.velocity = velocity;
    }
    this.prevPos = currentPos.clone();
    this.lastUpdate = now;

    return new Vector3(
      this.kalman.x.filter(currentPos.x),
      this.kalman.y.filter(currentPos.y),
      this.kalman.z.filter(currentPos.z)
    );
  }

  applyRecoilCompensation(offset) {
    const f = this.profile.recoilSmooth || 0.85;
    this.recoilOffset = this.recoilOffset.multiplyScalar(f).add(offset.multiplyScalar(1 - f));
  }

  dragAndLockHead(trackedPos) {
    const aimPoint = trackedPos.subtract(this.recoilOffset);
    const boosted = aimPoint.multiplyScalar(this.profile.accuracyBoost || 1.0);
    this.setCrosshair(boosted);
  }

  setCrosshair(vec3) {
    console.log("🎯 Locking Aim:", vec3.x.toFixed(6), vec3.y.toFixed(6), vec3.z.toFixed(6));
    // Thay thế bằng GameAPI.setAim nếu bạn tích hợp vào hệ thống thật
  }

  update(enemyHeadPos, recoilOffset) {
    const tracked = this.updateEnemyPosition(enemyHeadPos);
    this.applyRecoilCompensation(recoilOffset);
    this.dragAndLockHead(tracked);
  }
}

// === Bone Head Position (From Actual Bindpose + Transform) ===
const boneHeadPos = new Vector3(-0.0456970781, -0.004478302, -0.0200432576);
const recoilOffset = new Vector3(0.0, 0.0, 0.0);

// === Create Aim System with Specific Weapon ===
const currentWeapon = "AK47"; // Hoặc "MP40", "AWM", "DESERT_EAGLE", v.v.
const aimSystem = new AimLockUltimate(currentWeapon);

// === Run Loop (~60 FPS) ===
function runAimLoop() {
  aimSystem.update(boneHeadPos, recoilOffset);
  setTimeout(runAimLoop, 16);
}
runAimLoop();

function triggerLock(currentAim, targetPos, threshold = 0.004) {
  const dx = currentAim.x - targetPos.x;
  const dy = currentAim.y - targetPos.y;
  const dz = currentAim.z - targetPos.z;
  const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
  return dist <= threshold;
}

const aimVec = new Vector3(0.55, 0.12, -0.02);  // Tâm ngắm hiện tại
const boneHead = new Vector3(0.552, 0.121, -0.019); // Vị trí bone_Head

if (triggerLock(aimVec, boneHead)) {
  console.log("🔥 FIRE ALLOWED — Trigger Lock Passed");
  // GameAPI.fireWeapon();
} else {
  console.log("🚫 HOLD FIRE — Not Locked Enough");
}
