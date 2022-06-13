import { dataDir, join } from "@tauri-apps/api/path";

export const blobToBinary = async (blob) => {
	const buffer = await blob.arrayBuffer();

	return new Uint8Array(buffer);
};

export const getDataPath = async () => {
  const dataPath = await dataDir();
  return dataPath;
}

export const getSoundFile = async (fileName) => {
  const dataPath = await dataDir();
  return await join(dataPath, 'medical-sound-touch-data', 'sounds', fileName)
}
