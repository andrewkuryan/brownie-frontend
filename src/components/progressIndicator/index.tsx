import { FunctionalComponent } from 'preact';
import { useLayoutEffect, useRef } from 'preact/hooks';

import './progressIndicator.styl';

type Point = { x: number; y: number };
type Vector = { x: number; y: number };
type VectorFn = (v: Vector) => Vector;

type IndicatorSize = 'small' | 'large';

interface ProgressIndicatorProps {
    size: IndicatorSize;
}

const indicatorSizeParams = {
    large: {
        areaSize: 112,
        lineLength: 450,
        changeThreshold: [19, 31, 11, 29, 23],
    },
    small: {
        areaSize: 80,
        lineLength: 300,
        changeThreshold: [19, 11, 17, 15, 13],
    },
};

const leftTurnFn: VectorFn = v => ({ x: -v.y, y: v.x });
const rightTurnFn: VectorFn = v => ({ x: v.y, y: -v.x });
const oppositeTurn = (turn: VectorFn) => (turn === leftTurnFn ? rightTurnFn : leftTurnFn);

const getPointTranslate = (p: Point) => `translate3d(${p.x}px, ${p.y}px, 99px)`;

const ProgressIndicator: FunctionalComponent<ProgressIndicatorProps> = ({ size }) => {
    const rootRef = useRef<HTMLDivElement>(null);

    const { areaSize, lineLength, changeThreshold } = indicatorSizeParams[size];

    const pointRadius = 8;
    const pointGap = 2;
    const pointsCount = lineLength / pointGap;

    const isInsideField = (point: Point) =>
        point.x >= pointRadius &&
        point.x <= areaSize - pointRadius &&
        point.y >= pointRadius &&
        point.y <= areaSize - pointRadius;

    const needToTurn = (point: Point, direction: Vector) =>
        !isInsideField({ x: point.x + direction.x, y: point.y + direction.y });

    const canTurn = (point: Point, direction: Vector, turn: VectorFn) =>
        !needToTurn(point, turn(direction));

    useLayoutEffect(() => {
        if (rootRef.current) {
            const startX = Math.random() * (areaSize - 2 * pointRadius) + pointRadius;
            const startY = Math.random() * (areaSize - 2 * pointRadius) + pointRadius;
            const points: Array<Point> = [{ x: startX, y: startY }];
            const elements: Array<HTMLDivElement> = [];

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
                if (elements.length < pointsCount) {
                    const newPointDiv = document.createElement('div');
                    newPointDiv.setAttribute(
                        'style',
                        `transform: ${getPointTranslate(
                            points[points.length - 1],
                        )}; opacity: ${points.length * (1 / pointsCount)}`,
                    );
                    newPointDiv.setAttribute('class', 'progressIndicatorLinePoint');
                    rootRef.current?.appendChild(newPointDiv);
                    elements.push(newPointDiv);
                }

                const newPoint = {
                    x: points[points.length - 1].x + direction.x,
                    y: points[points.length - 1].y + direction.y,
                };
                points.push(newPoint);
                if (points.length > pointsCount) {
                    for (let elemIndex = 0; elemIndex < elements.length; elemIndex++) {
                        elements[elemIndex].style.transform = getPointTranslate(
                            points[elemIndex + 1],
                        );
                    }
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
            };

            requestAnimationFrame(step);
        }
    }, []);

    return <div ref={rootRef} class="progressIndicator" />;
};

export default ProgressIndicator;
