import { path, os } from '@tauri-apps/api';
import {
	readDir,
	BaseDirectory,
	createDir,
	writeFile,
	readTextFile,
  copyFile,
} from '@tauri-apps/api/fs';
import { appDir, dataDir, join, resolve } from '@tauri-apps/api/path';

const dataFileName = 'data.json';
const dir = BaseDirectory.Data;

console.log("## STORAGE ##");

let srcPath;

// resolve().then(res => {
//   join(res, "..", "src").then(realRes => {
//     srcPath = realRes;
//   });
// });

path.resourceDir().then(res => {
  let platform;
  os.platform().then(os_platform => {
    platform = os_platform;

    let tmp = res;

    if(platform == "win32") {
      tmp = tmp.split("\\\\?\\")[1];
    }

    join(tmp, "_up_", "src").then(realRes => {
      srcPath = realRes;
    });
  });
});

const initData = {
  buttons: [
    {
      id: "1",
      published: true,
      key: "1",
      image: "1.png",
      sound: "1.mp4",
      message: "바닥에 발 모양 위에 서시고, 턱을 대고 양팔을 벌려 기계를 안으세요.",
    },
    {
      id: "2",
      published: true,
      key: "2",
      image: "2.png",
      sound: "2.mp4",
      message: "숨을 깊게 들어마시고, 숨 참으세요.",
    },
    {
      id: "3",
      published: true,
      key: "3",
      image: "3.png",
      sound: "3.mp4",
      message: "촬영이 끝났습니다. 옷 갈아입으시면 됩니다.",
    },
    {
      id: "4",
      published: true,
      key: "4",
      image: "4.png",
      sound: "4.mp4",
      message: "메시지를 읽어주세요. - 4",
    },
    {
      id: "5",
      published: true,
      key: "5",
      image: "5.png",
      sound: "5.mp4",
      message: "메시지를 읽어주세요. - 5",
    },
    {
      id: "6",
      published: true,
      key: "6",
      image: "6.png",
      sound: "6.mp4",
      message: "메시지를 읽어주세요. - 6",
    },
    {
      id: "7",
      published: true,
      key: "7",
      image: "7.png",
      sound: "7.mp4",
      message: "메시지를 읽어주세요. - 7",
    },
    {
      id: "8",
      published: true,
      key: "8",
      image: "8.png",
      sound: "8.mp4",
      message: "메시지를 읽어주세요. - 8",
    },
    {
      id: "9",
      published: true,
      key: "9",
      image: "9.png",
      sound: "9.mp4",
      message: "메시지를 읽어주세요. - 9",
    }
  ],
  languages: [
    {
      id: "1",
      name: "한국어",
      published: true
    },
    {
      id: "2",
      name: "태국어",
      published: true
    },
    {
      id: "3",
      name: "",
      published: false
    },
    {
      id: "4",
      name: "",
      published: false
    },
    {
      id: "5",
      name: "",
      published: false
    },
    {
      id: "6",
      name: "",
      published: false
    },
    {
      id: "7",
      name: "",
      published: false
    },
    {
      id: "8",
      name: "",
      published: false
    },
    {
      id: "9",
      name: "",
      published: false
    },
    {
      id: "10",
      name: "",
      published: false
    }
  ],
  invoke_key: "Shift+1",
  lang_change_key: "Shift+L"
};

const _checkDataFolder = async () => {
	try {
		const files = await readDir('medical-sound-touch-data', {
			dir: dir
		});

		const fileNames = files.map(({ name }) => name);

		return fileNames.includes(dataFileName);
	} catch (e) {
		return false;
	}
};

const _createDatabase = async () => {
	try {
		await createDir('medical-sound-touch-data', {
			dir: dir,
			recursive: true
		});

    await createDir('medical-sound-touch-data/images', {
			dir: dir,
			recursive: true
		});

    await createDir('medical-sound-touch-data/sounds', {
			dir: dir,
			recursive: true
		});

		await writeFile(
			{
				contents: JSON.stringify(initData, null, 2),
				path: `./medical-sound-touch-data/${dataFileName}`
			},
			{
				dir: dir
			}
		);

    for(var i = 1; i <= 9; i++) {
      console.log(dir);
      await copyFile(
        srcPath + "/assets/sounds/1_"+i+".mp3",
        "medical-sound-touch-data/sounds/1_"+i+".mp3",
        {
          dir: dir
        }
      );
      await copyFile(
        srcPath + "/assets/sounds/2_"+i+".mp3",
        "medical-sound-touch-data/sounds/2_"+i+".mp3",
        {
          dir: dir
        }
      );
      await copyFile(
        srcPath + "/assets/images/img_"+i+".png",
        "medical-sound-touch-data/images/img_"+i+".png",
        {
          dir: dir
        }
      );
    }
    console.log("DIR", dir);
    console.log("SOURCE PATH", srcPath);
    console.log("APP DIR", appDir.name);
    console.log("Base", BaseDirectory);
    console.log("Base DATA", BaseDirectory.Data);

	} catch (e) {
		console.log(e);
	}
};

export const initStorage = async () => {
	const hasDataFolder = await _checkDataFolder();

	if (!hasDataFolder) {
		await _createDatabase();
	}
};

export const getStoredPosts = async () => {
	try {
		const res = await readTextFile(`medical-sound-touch-data/${dataFileName}`, {
			dir: dir
		});
		return JSON.parse(res);
	} catch (e) {
		return [];
	}
};

export const saveState = async (data) => {
	await writeFile(
		{
			contents: data,
			path: `./medical-sound-touch-data/${dataFileName}`
		},
		{
			dir: dir
		}
	);
};
