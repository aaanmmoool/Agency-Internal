/**
 * Live camera status, written by the camera controller and read by the
 * frameloop manager, so demand rendering never freezes a shot mid-move.
 */
export const cameraState = {
  /** True while the camera is still easing towards its desired shot. */
  settling: false,
};
