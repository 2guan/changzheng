/** Convert a subject's horizontal image coordinate into bounded camera travel. */
export function focalPan(
  focusX: number,
  imageWidth: number,
  viewportWidth: number,
) {
  const travel = imageWidth - viewportWidth;
  if (travel <= 0) return 0.5;
  return Math.max(
    0,
    Math.min(1, (focusX * imageWidth - viewportWidth / 2) / travel),
  );
}
