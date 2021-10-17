declare var brownieProgressIndicatorActive: boolean;

declare var stopBrownieIndicator: () => void;
declare var startBrownieIndicator: (
    areaSize: number,
    pointRadius: number,
    pointGap: number,
    pointsCount: number,
    changeThreshold: Array<number>,
    parent: HTMLDivElement,
) => void;
