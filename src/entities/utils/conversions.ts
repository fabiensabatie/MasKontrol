export default {
	int64: {
		to: {
			'8Bytes': (int64: number): number[] => {
				let y: number = Math.floor(int64 / 2 ** 32);
				return [y, y << 8, y << 16, y << 24, int64, int64 << 8, int64 << 16, int64 << 24].map(
					(z) => z >>> 24
				);
			},
		},
	},
};
