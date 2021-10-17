type Point = { x: number; y: number };
type Vector = { x: number; y: number };
type VectorFn = (v: Vector) => Vector;

const leftTurnFn: VectorFn = v => ({ x: -v.y, y: v.x });
const rightTurnFn: VectorFn = v => ({ x: v.y, y: -v.x });
const oppositeTurn = (turn: VectorFn) => (turn === leftTurnFn ? rightTurnFn : leftTurnFn);

const add = (p: Point, v: Vector): Point => ({ x: p.x + v.x, y: p.y + v.y });
const subtract = (p1: Point, p2: Point): Vector => ({ x: p1.x - p2.x, y: p1.y - p2.y });
const equalPoints = (p1: Point, p2: Point) => p1.x === p2.x && p1.y === p2.y;
const equalVectors = (v1: Vector | null, v2: Vector | null) =>
    v1?.x === v2?.x && v1?.y === v2?.y;

type StyleVariant = 'left' | 'right' | 'top' | 'bottom' | 'horizontal' | 'vertical' | 'all';
type StyleValue = string | number;
type Styles = { [key: string]: { [key in StyleVariant]?: StyleValue } };
type SelectedStyles<S extends Styles> = { [key in keyof S]: StyleValue };

function processStyleVariants<S extends Styles>(
    styles: S,
    direction: Vector,
): SelectedStyles<S> {
    const stylesResult: any = {};
    Object.entries(styles).forEach(([key, value]) => {
        if (direction.x > 0) {
            stylesResult[key] = value.right ?? value.horizontal ?? value.all;
        } else if (direction.x < 0) {
            stylesResult[key] = value.left ?? value.horizontal ?? value.all;
        } else if (direction.y > 0) {
            stylesResult[key] = value.bottom ?? value.vertical ?? value.all;
        } else if (direction.y < 0) {
            stylesResult[key] = value.top ?? value.vertical ?? value.all;
        }
    });
    return stylesResult;
}

const colorWithOpacity = (opacity: number) =>
    `rgb(${42 + 213 * (1 - opacity)}, ${100 + 155 * (1 - opacity)}, ${
        56 + 199 * (1 - opacity)
    })`;

const createLine = (
    firstPoint: Point,
    secondPoint: Point,
    firstOpacity: number,
    secondOpacity: number,
    pointRadius: number,
    direction: Vector,
    index: number,
    prevIndex: number,
    isOutside: boolean,
) => {
    const newDiv = document.createElement('div');
    const divShadow = document.createElement('div');

    const firstColor = colorWithOpacity(firstOpacity);
    const secondColor = colorWithOpacity(secondOpacity);

    const { elemWidth, elemHeight, elemLeft, elemTop, linearGradient } = processStyleVariants(
        {
            elemWidth: {
                horizontal: Math.abs(firstPoint.x - secondPoint.x) + 1.25 * pointRadius,
                vertical: pointRadius,
            },
            elemHeight: {
                horizontal: pointRadius,
                vertical: Math.abs(firstPoint.y - secondPoint.y) + 1.25 * pointRadius,
            },
            elemLeft: {
                right: firstPoint.x - 0.75 * pointRadius,
                left: secondPoint.x - pointRadius / 2,
                vertical: firstPoint.x - pointRadius / 2,
            },
            elemTop: {
                horizontal: firstPoint.y - pointRadius / 2,
                bottom: firstPoint.y - 0.75 * pointRadius,
                top: secondPoint.y - pointRadius / 2,
            },
            linearGradient: {
                right: `to right, ${firstColor} 20%, ${secondColor} 80%`,
                left: `to left, ${firstColor} 20%, ${secondColor} 80%`,
                bottom: `to bottom, ${firstColor} 20%, ${secondColor} 80%`,
                top: `to top, ${firstColor} 20%, ${secondColor} 80%`,
            },
        },
        direction,
    );

    const { shadowBorderRadius, shadowWidth, shadowHeight, shadowTop, shadowLeft } =
        processStyleVariants(
            {
                shadowBorderRadius: isOutside
                    ? { all: `${pointRadius / 2}px` }
                    : {
                          right: `0 ${pointRadius / 2}px ${pointRadius / 2}px 0`,
                          left: `${pointRadius / 2}px 0 0 ${pointRadius / 2}px`,
                          bottom: `0 0 ${pointRadius / 2}px ${pointRadius / 2}px`,
                          top: `${pointRadius / 2}px ${pointRadius / 2}px 0 0`,
                      },
                shadowWidth: {
                    horizontal: (elemWidth as number) - pointRadius,
                    vertical: pointRadius,
                },
                shadowHeight: {
                    horizontal: pointRadius,
                    vertical: (elemHeight as number) - pointRadius,
                },
                shadowLeft: {
                    right: (elemLeft as number) + pointRadius,
                    left: elemLeft,
                    vertical: elemLeft,
                },
                shadowTop: {
                    horizontal: elemTop,
                    top: elemTop,
                    bottom: (elemTop as number) + pointRadius,
                },
            },
            direction,
        );

    newDiv.setAttribute(
        'style',
        `left:${elemLeft}px;top:${elemTop}px;width:${elemWidth}px;height:${elemHeight}px;background:linear-gradient(${linearGradient});z-index:${index}`,
    );
    divShadow.setAttribute(
        'style',
        `width:${shadowWidth}px;height:${shadowHeight}px;top:${shadowTop}px;left:${shadowLeft}px;border-radius:${shadowBorderRadius};box-shadow: 0 0 8px ${firstColor};z-index:${
            prevIndex - 1
        }`,
    );
    divShadow.setAttribute('class', 'progressIndicatorLineShadow');
    newDiv.setAttribute('class', 'progressIndicatorLine');
    return [newDiv, divShadow];
};

export function stopIndicator() {
    brownieProgressIndicatorActive = false;
}

export function startIndicator(
    areaSize: number,
    pointRadius: number,
    pointGap: number,
    pointsCount: number,
    changeThreshold: Array<number>,
    parent: HTMLDivElement,
) {
    const isInsideField = (point: Point) =>
        point.x >= pointRadius / 2 &&
        point.x <= areaSize - pointRadius / 2 &&
        point.y >= pointRadius / 2 &&
        point.y <= areaSize - pointRadius / 2;

    const needToTurn = (point: Point, direction: Vector) =>
        !isInsideField(add(point, direction));

    const canTurn = (point: Point, direction: Vector, turn: VectorFn) =>
        !needToTurn(point, turn(direction));

    const startX =
        Math.round((Math.random() * (areaSize - pointRadius) + pointRadius / 2) / 2) * 2;
    const startY =
        Math.round((Math.random() * (areaSize - pointRadius) + pointRadius / 2) / 2) * 2;
    const points: Array<Point> = [{ x: startX, y: startY }];

    let elements: Array<HTMLDivElement> = [];

    let direction: Vector = [
        { x: 0, y: pointGap },
        { x: pointGap, y: 0 },
        { x: 0, y: -pointGap },
        { x: -pointGap, y: 0 },
    ][Math.round(Math.random() * 3)];

    let changeCounter = 0;
    let thresholdIndex = 0;
    let prevTurn: VectorFn = leftTurnFn;

    const turn = (newPoint: Point) => {
        if (canTurn(newPoint, direction, oppositeTurn(prevTurn))) {
            prevTurn = oppositeTurn(prevTurn);
        }
        direction = prevTurn(direction);
        changeCounter = 0;
    };

    const step = () => {
        if (brownieProgressIndicatorActive) {
            elements.forEach(el => el.remove());
            elements = [];

            if (points.length >= 2) {
                let firstPoint = points[0];
                let firstPointIndex = 0;
                let lineDirection: Vector = subtract(points[1], points[0]);
                for (let i = 2; i <= points.length; i++) {
                    const newDirection =
                        i < points.length ? subtract(points[i], points[i - 1]) : null;
                    if (!equalVectors(newDirection, lineDirection)) {
                        if (!equalPoints(points[i - 1], firstPoint)) {
                            elements.push(
                                ...createLine(
                                    firstPoint,
                                    points[i - 1],
                                    Math.min((firstPointIndex / points.length) * 2, 1),
                                    Math.min((i / points.length) * 2, 1),
                                    pointRadius,
                                    lineDirection,
                                    i - 1,
                                    firstPointIndex,
                                    firstPointIndex === 0 || i === points.length,
                                ),
                            );
                        }
                        if (newDirection !== null) {
                            lineDirection = newDirection;
                            firstPoint = points[i];
                            firstPointIndex = i;
                        }
                    }
                }
            }
            parent.append(...elements);

            const newPoint = add(points[points.length - 1], direction);
            points.push(newPoint);
            if (points.length > pointsCount) {
                points.shift();
            }
            if (changeCounter === changeThreshold[thresholdIndex]) {
                turn(newPoint);
                thresholdIndex = (thresholdIndex + 1) % changeThreshold.length;
            }
            if (needToTurn(newPoint, direction)) {
                turn(newPoint);
            }

            changeCounter += 1;
            requestAnimationFrame(step);
        }
    };

    brownieProgressIndicatorActive = true;
    requestAnimationFrame(step);
}
