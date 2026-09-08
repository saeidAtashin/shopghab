export type CropRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type ImageToolProgress = (message: string) => void;

export type ImageToolAction =
  | "removeBackground"
  | "personCutout"
  | "faceCutout"
  | "crop";
