declare module '*.svg' {
    import { FunctionalComponent } from 'preact';

    const SvgrComponent: FunctionalComponent<{ [key in keyof SVGElement]?: SVGElement[key] }>;
    export default SvgrComponent;
}
