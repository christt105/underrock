declare module "electron" {
	interface SaveDialogOptions {
		title?: string;
		defaultPath?: string;
		filters?: { name: string; extensions: string[] }[];
	}

	interface SaveDialogResult {
		canceled: boolean;
		filePath?: string;
	}

	export const remote: {
		dialog: {
			showSaveDialog(options: SaveDialogOptions): Promise<SaveDialogResult>;
		};
	};
}
