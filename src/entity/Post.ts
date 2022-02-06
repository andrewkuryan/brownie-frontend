import { StorageFile } from '@entity/StorageFile';

export class Post {
    constructor(
        public readonly id: number,
        public readonly authorId: number,
        public readonly title: string,
        public readonly paragraphs: Array<Paragraph>,
        public readonly category: Category,
        public readonly tags: Array<Tag>,
        public readonly createdAt: Date,
    ) {}
}

export class TextParagraph {
    constructor(public readonly items: Array<TextItem>) {}
}

export class ImageParagraph {
    constructor(
        public readonly file: StorageFile,
        public readonly description: string | null,
    ) {}
}

export type Paragraph = TextParagraph | ImageParagraph;

export class TextItem {
    constructor(public readonly text: string, public readonly formatting: TextFormatting) {}
}

export type FontWeight = 'NORMAL' | 'BOLD';
export type FontStyle = 'NORMAL' | 'ITALIC';
export type TextDecoration = 'NONE' | 'UNDERLINE';

export class TextFormatting {
    constructor(
        public readonly fontWeight: FontWeight,
        public readonly fontStyle: FontStyle,
        public readonly textDecoration: TextDecoration,
    ) {}
}

export class TopLevelCategory {
    constructor(public readonly id: number, public readonly data: TopLevelCategoryData) {}
}

export class SecondaryCategory {
    constructor(public readonly id: number, public readonly data: SecondaryCategoryData) {}
}

export type Category = TopLevelCategory | SecondaryCategory | 'Unclassified';

export class TopLevelCategoryData {
    constructor(public readonly name: string, public readonly scope: MetadataScope) {}
}

export class SecondaryCategoryData {
    constructor(
        public readonly name: string,
        public readonly scope: MetadataScope,
        public readonly parent: Category,
    ) {}
}

export type CategoryData = TopLevelCategoryData | SecondaryCategoryData;

export class AuthorScope {
    constructor(public readonly authorId: number) {}
}

export type MetadataScope = 'Global' | AuthorScope;

export class RGBTagColor {
    constructor(
        public readonly r: number,
        public readonly g: number,
        public readonly b: number,
    ) {}
}

export type TagColor = RGBTagColor | 'None';

export class TagType {
    constructor(
        public readonly name: string,
        public readonly category: Category,
        public readonly scope: MetadataScope,
    ) {}
}

export class Tag {
    constructor(
        public readonly type: TagType,
        public readonly name: string,
        public readonly category: Category,
        public readonly color: TagColor,
        public readonly scope: MetadataScope,
    ) {}
}

export function tagColorToRgb(color: TagColor): string {
    if (color === 'None') {
        return 'rgb(255, 255, 255)';
    } else {
        return `rgb(${color.r}, ${color.g}, ${color.b})`;
    }
}

export function postCategories(post: Post): Array<string> {
    const result: Array<string> = [];

    function addCategory(category: Category) {
        if (category !== 'Unclassified') {
            result.push(category.data.name);
        }
        if (category instanceof SecondaryCategory) {
            addCategory(category.data.parent);
        }
    }

    addCategory(post.category);
    return result.reverse();
}
