import { FunctionalComponent } from 'preact';
import { StorageFile } from '@entity/StorageFile';
import { useEffect } from 'preact/hooks';
import { ReduxProps } from '../../../Main';
import { arrayBufferToBase64 } from '@utils/transforms';

export interface ApiImageProps extends ReduxProps {
    file: StorageFile;
}

const ApiImage: FunctionalComponent<ApiImageProps> = ({ file, dispatch, useStore }) => {
    const fileContent = useStore(state => state.file.files[file.id], `ApiImage ${file.id}`);
    useEffect(() => {
        dispatch({ type: 'FILE/LOAD_FILE', payload: file });
        return () => dispatch({ type: 'FILE/RELEASE_FILE', payload: file.id });
    }, []);
    return fileContent ? (
        <img
            src={`data:image/${file.format};base64,${arrayBufferToBase64(
                fileContent.content,
            )}`}
            alt={`${file.id}.${file.format}`}
        />
    ) : null;
};

export default ApiImage;
