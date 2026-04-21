/**
 * Copyright (c) 2024 Discover Financial Services
 */
import React, { Component } from 'react';
import { styled } from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { EditorState } from 'draft-js';

interface Props {
    id?: string;
    data: EditorState;
    setData: React.Dispatch<React.SetStateAction<EditorState>>;
    editMode: boolean;
    onBlur: () => Promise<void>;
    uploadImageCallback: (file: File) => Promise<any>;
    required?: boolean;
    label?: string;
    setError: (name: string, text: string) => void;
}

const EditorDiv = styled('div')(({ theme }: any) => ({
    border: 'var(--border-1) solid var(--border) !important',
    borderRadius: 'var(--radius-1)',
    marginTop: theme.spacing(1.25),
    marginBottom: theme.spacing(1.25),
    paddingLeft: theme.spacing(1.25),
    paddingTop: theme.spacing(1.25),
    paddingBottom: theme.spacing(1.25),
    paddingRight: theme.spacing(1.25),
    '.editorToolbar': {
        backgroundColor: 'var(--Slate-0)',
        border: 'var(--border-1) solid var(--border) !important',
        borderRadius: 'var(--radius-1)',
    },
}));

const MyErrorAlertIcon = styled(ErrorIcon)(({ theme }: any) => ({
    width: '12px',
    height: '12px',
}));

/**
 * Component for rendering comments.
 *
 * @param {DocumentInfo} props.tabbed_document_view
 *
 * @param props.id - Editor id
 * @param props.data - Editor content
 * @param props.setData - Set editor content
 * @param props.editMode - True if in edit mode
 * @param props.onBlur - Called when editor loses focus
 * @param props.uploadImageCallback - Called when an image is uploaded
 * @param props.required - True if editor is required
 * @param props.label - Editor label
 * @param props.setError
 *
 * @returns {JSX.Element}
 */
class EditorContainer extends Component<Props> {
    focus = () => {
        //console.log("Editor FOCUS");
    };

    blur = () => {
        //console.log("Editor BLUR")
        this.props.onBlur();
    };

    // The content isn't set yet when this is called - so this doesn't work
    uploadCallback = async (file: File) => {
        console.log('EditorContainer.uploadCallback()');
        const r = await this.props.uploadImageCallback(file);
        this.props.onBlur(); // force save of editor content
        console.log('EditorContainer.uploadCallback() - DONE');
        return r;
    };

    componentDidMount = () => {
        //console.log("Editor mounted: " + this.props.id);
        //if (this.state.editMode) {
        //  this.focus();
        //}
        this.focus();

        let v = this.props.data.getCurrentContent().getPlainText();
        if (this.props.required) {
            if (!v) {
                this.props.setError(
                    this.props.label || 'Editor',
                    'This question is required.'
                );
                this.error = true;
            } else {
                this.props.setError(this.props.label || 'Editor', '');
                this.error = false;
            }
        }
    };

    error = false;

    onEditorStateChange = (editorState: EditorState) => {
        console.log('Editor onStateChange: ' + this.props.id);
        if (this.props.setData) {
            this.props.setData(editorState);
            let v = editorState.getCurrentContent().getPlainText();
            console.log(' - editor value =', v);
            if (this.props.required) {
                if (!v) {
                    this.props.setError(
                        this.props.label || 'Editor',
                        'This question is required.'
                    );
                    this.error = true;
                } else {
                    this.props.setError(this.props.label || 'Editor', '');
                    this.error = false;
                }
            }
        }
    };

    displayError() {
        if (this.error) {
            return (
                <div style={{ color: '#A01C2B', fontSize: '14px' }}>
                    <MyErrorAlertIcon /> This question is required.
                </div>
            );
        }
    }

    render() {
        return (
            <EditorDiv className="editor">
                <Editor
                    editorState={this.props.data}
                    onEditorStateChange={this.onEditorStateChange}
                    onBlur={this.blur}
                    onFocus={this.focus}
                    //ref={this.editorRef}
                    readOnly={!this.props.editMode}
                    // toolbarHidden={true}
                    // toolbarOnFocus={true}
                    toolbarClassName="editorToolbar"
                    toolbar={{
                        inline: { inDropdown: true },
                        list: { inDropdown: true },
                        textAlign: { inDropdown: true },
                        link: { inDropdown: true },
                        history: { inDropdown: true },
                        image: {
                            uploadCallback: this.uploadCallback,
                            previewImage: true,
                        },
                    }}
                />
                {this.displayError()}
            </EditorDiv>
        );
    }
}

export default EditorContainer;
