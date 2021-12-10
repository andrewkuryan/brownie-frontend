import { Component, RenderableProps, VNode } from 'preact';

import './textEditor.styl';

interface TextEditorProps {
    defaultContent?: VNode;
    onSelect: (text: string, classes: Array<string>) => void;
}

class TextEditor extends Component<TextEditorProps, {}> {
    selectText = () => {
        const selection = window.getSelection();
        if (selection) {
            console.log(selection);
            if (
                selection.anchorNode &&
                selection.focusNode &&
                selection.anchorNode === selection.focusNode
            ) {

            }
        }
    };

    wrapSelected = (classNames: Array<string>) => {
        const selection = window.getSelection();
        if (selection) {
            console.log(selection);
            if (
                selection.anchorNode &&
                selection.focusNode &&
                selection.anchorNode === selection.focusNode
            ) {
                if (
                    selection.anchorNode.parentElement?.classList.contains('textItem') &&
                    selection.anchorOffset === 0 &&
                    selection.focusOffset === selection.anchorNode?.textContent?.length
                ) {
                    selection.anchorNode.parentElement.classList.add(...classNames);
                } else {
                    console.log(selection.anchorNode);
                    const firstOffset = Math.min(
                        selection.anchorOffset,
                        selection.focusOffset,
                    );
                    const secondOffset = Math.max(
                        selection.anchorOffset,
                        selection.focusOffset,
                    );
                    const before =
                        selection.anchorNode.textContent?.substring(0, firstOffset) ?? '';
                    const after =
                        selection.anchorNode.textContent?.substring(secondOffset) ?? '';
                    const selected =
                        selection.anchorNode.textContent?.substring(
                            firstOffset,
                            secondOffset,
                        ) ?? '';
                    const beforeItem = document.createElement('span');
                    beforeItem.className = 'textItem';
                    beforeItem.textContent = before;
                    const selectedItem = document.createElement('span');
                    selectedItem.className = `textItem ${classNames.join(' ')}`;
                    selectedItem.textContent = selected;
                    const afterItem = document.createElement('span');
                    afterItem.className = 'textItem';
                    afterItem.textContent = after;
                    if (before.length > 0) {
                        console.log(beforeItem);
                        selection.anchorNode.parentNode?.insertBefore(
                            beforeItem,
                            selection.anchorNode,
                        );
                    }
                    console.log(selectedItem);
                    selection.anchorNode.parentNode?.insertBefore(
                        selectedItem,
                        selection.anchorNode,
                    );
                    if (after.length > 0) {
                        console.log(afterItem);
                        selection.anchorNode.parentNode?.insertBefore(
                            afterItem,
                            selection.anchorNode,
                        );
                    }
                    selection.anchorNode.parentNode?.removeChild(selection.anchorNode);

                    const range = new Range();
                    console.log(selectedItem.classList);
                    range.selectNodeContents(selectedItem.firstChild!);
                    window.getSelection()?.removeAllRanges();
                    window.getSelection()?.addRange(range);
                }
            }
        }
    };

    componentDidMount() {
        document.addEventListener('selectionchange', this.selectText);
    }

    componentWillUnmount() {
        document.removeEventListener('selectionchange', this.selectText);
    }

    render({ defaultContent }: RenderableProps<TextEditorProps>) {
        return (
            <div class="textEditorField" contentEditable={true}>
                {defaultContent}
            </div>
        );
    }
}

export default TextEditor;
