/**
 * Copyright (c) 2024 Discover Financial Services
 */
import React, { useState, useEffect } from 'react';
import { Button } from '@mui/material';
import { CommentInfo, DocumentInfo, formatDateTime } from '../common/common';
import { AppContext } from '../common/states';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import {
    EditorState,
    ContentState,
    convertToRaw,
    convertFromRaw,
} from 'draft-js';
import parse from 'html-react-parser';
import EditorContainer from './EditorContainer';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import { DocMgr } from '../models/DocMgr';
import Tooltip from '@mui/material/Tooltip';
import { styled } from '@mui/system';

const TableTheme = styled('table')(({ theme }) => {
    return {
        width: '100%',
        th: {
            // backgroundColor: theme.palette.secondary.main,
            // color: theme.palette.primary.contrastText,
            padding: theme.spacing(1.25),
            // fontSize: "large",
        },
        tr: {
            backgroundColor: '#dedede',
        },
        td: {
            padding: theme.spacing(1.25),
        },
        '.center': {
            textAlign: 'center',
        },
    };
});

interface Props {
    document: DocumentInfo;
    setDocument: (
        document: DocumentInfo,
        fields?: string[]
    ) => Promise<void> | undefined;
    context: AppContext;
    topic?: string;
    customHeading?: string;
    searchString?: string;
}

/**
 * Component for rendering comments.
 *
 * @param {DocumentInfo} props.document - The document info
 * @param props.setDocument - The function to set the document
 * @param {AppContext} props.context - The app context
 * @param props.topic
 * @param props.searchString
 *
 * @returns {JSX.Element}
 */
const Comments: React.FC<Props> = ({
    document,
    setDocument,
    context,
    topic,
    searchString,
}) => {
    const docMgr = DocMgr.getInstance();
    const editMode = context.editMode;
    const canAddComment = true;

    // Comment index to edit
    const [edit, setEdit] = useState<number>(-1);

    // Comment text to edit
    const [data, setData] = useState<EditorState>(EditorState.createEmpty());

    // Comment text to add
    // Use local storage to save new comment until it's added
    const ccomment = window.localStorage.getItem('editorContent-comment');
    const [newComment, setNewComment] = useState<EditorState>(
        ccomment
            ? EditorState.createWithContent(
                  convertFromRaw(JSON.parse(ccomment))
              )
            : EditorState.createEmpty()
    );
    const [newCommentPrivate, setNewCommentPrivate] = useState<boolean>(false);

    const commentEditorContainer = React.useRef(null);
    const commentEditor = React.useRef(null);

    /**
     * Add a new comment
     *
     * @param event
     */
    async function addComment(event: any): Promise<void> {
        let text = draftToHtml(convertToRaw(newComment.getCurrentContent()));
        console.log('Add comment: ', text);
        const _topic = topic === '*' ? '' : topic;
        const r = await docMgr.addComment(
            document,
            text,
            _topic,
            newCommentPrivate
        );
        if (r) {
            setNewComment(EditorState.createEmpty());
            setNewCommentPrivate(false);
            window.localStorage.setItem('editorContent-comment', '');
            setDocument(r);
        }
    }

    /**
     * Delete a comment
     *
     * @param index
     */
    async function deleteComment(index: number | string): Promise<void> {
        console.log('deleteComment: ', index);
        // @TODO: Add confirm dialog
        if (typeof index === 'string') {
            const r = await docMgr.deleteCommentForId(document, index);
            if (r) {
                setDocument(r);
            }
        } else if (index >= 0) {
            // const r = await docMgr.deleteComment(document, index);
            // if (r) {
            //     setDocument(r);
            // }
        }
    }

    //async function togglePrivate(index: number, event: any): Promise<void> {
    //    console.log('togglePrivate: ', index, 'checked=', event.target.checked);
    //    const r = await docMgr.updateCommentForId(
    //        document,
    //        document.comments[index].id,
    //        { private: event.target.checked }
    //    );
    //    //const r = await ideationMgr.setCommentPrivate(document, index, event.target.checked);
    //    if (r) {
    //        setDocument(r);
    //    }
    //}

    //async function toggleNewCommentPrivate(event: any): Promise<void> {
    //    console.log(
    //        'toggleNewCommentPrivate: ',
    //        'checked=',
    //        event.target.checked
    //    );
    //    setNewCommentPrivate(event.target.checked);
    //}

    /**
     * New comment editor looses focus.
     * The text is saved to local storage in case user navigates away from page before adding.
     */
    async function onBlur() {
        window.localStorage.setItem(
            'editorContent-comment',
            JSON.stringify(convertToRaw(newComment.getCurrentContent()))
        );
    }

    async function onBlurEdit() {}

    function uploadImageCallback(file: File): Promise<any> {
        console.log('uploadImageCallback()');
        return new Promise(async (resolve, reject): Promise<any> => {
            let r = await docMgr.uploadAttachment(document.id, file);
            setDocument({ ...document, attachments: r });
            for (var i = 0; i < r.length; i++) {
                if (r[i].name === file.name) {
                    resolve({ data: { link: r[i].url } });
                }
            }
            resolve({ data: { link: 'Error uploading' } });
        });
    }

    /**
     * Show editor for selected comment
     *
     * @param index
     */
    const showEditor = (index: number, event: any) => {
        console.log('showEditor(' + index + ')');
        let container = event.target;
        while (
            container &&
            !container.classList?.contains('commentContainer')
        ) {
            container = container.parentNode;
        }
        let destEl = null;
        if (container) {
            for (var child of container.children) {
                if (child.classList.contains('commentContainerForEditor')) {
                    destEl = child;
                }
            }
        }
        const editorEl = commentEditor.current as any;
        if (editorEl && destEl) {
            destEl.appendChild(editorEl);
            const blocksFromHtml = htmlToDraft(document.comments[index].text);
            const { contentBlocks, entityMap } = blocksFromHtml;
            const contentState = ContentState.createFromBlockArray(
                contentBlocks,
                entityMap
            );
            const editorState = EditorState.createWithContent(contentState);
            setData(editorState);
            setEdit(index);
        }
    };

    /**
     * Update comment being edited
     */
    const updateComment = async () => {
        console.log('updateComment: ');
        let text = draftToHtml(convertToRaw(data.getCurrentContent()));
        console.log('Update comment: ', text);
        if (edit >= 0) {
            let r = null;
            if (document.comments[edit].id) {
                r = await docMgr.updateCommentForId(
                    document,
                    document.comments[edit].id,
                    { text: text }
                );
            } else {
                // r = await docMgr.updateComment(document, edit, text, context.user);
            }
            if (r) {
                setEdit(-1);
                setDocument(r);
            }
        }
    };

    useEffect(() => {
        console.log('Comments: edit=', edit);
        const editorEl = commentEditor.current as any;
        if (edit === -1) {
            // console.log("Moving editor back to original div")
            const destEl = commentEditorContainer.current as any;
            if (editorEl && destEl) {
                destEl.appendChild(editorEl);
            }
            window.document.body.classList.remove('only-div');
            editorEl?.classList.remove('only-show-div');
        } else if (edit >= 0) {
            window.document.body.classList.add('only-div');
            editorEl?.classList.add('only-show-div');
        }
    }, [edit]);

    const getTooltipTitle = (comment: CommentInfo) => {
        const r = [];
        if (comment.edited) {
            for (var c of comment.edited) {
                r.push(
                    <tr key={'commentEdited-' + c.date}>
                        <td>{c.user.name}</td>
                        <td>{formatDateTime(c.date)}</td>
                    </tr>
                );
            }
        }
        return (
            <div style={{ padding: '10px' }}>
                <div style={{ paddingBottom: '10px' }}>
                    <b>Previous comment edits:</b>
                </div>
                <TableTheme className="roundedTable">
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>{r}</tbody>
                </TableTheme>
            </div>
        );
    };

    const showComment = (comment: CommentInfo) => {
        // if (!comment.private) return true;
        // if (editMode || comment.user.email == context.user.email) {
        //     return true;
        const isPublicComment = !comment.private;
        const isEditable =
            editMode || comment.user.email === context.user.email;
        if (!searchString || searchString === '') {
            if (isPublicComment || isEditable) return true;
        } else {
            const textIncludes = comment.text
                .toLowerCase()
                .includes(searchString.toLowerCase());
            const nameIncludes = comment.user.name
                .toLowerCase()
                .includes(searchString.toLowerCase());
            if (textIncludes || nameIncludes) {
                if (isPublicComment || isEditable) return true;
            }
        }
        return false;
    };

    console.log('Comments: editMode=', editMode);

    return (
        <div>
            {document.comments.length > 0 && (
                <>
                    {document.comments.map((comment: any, i) => {
                        if (
                            !topic ||
                            topic === '*' ||
                            topic === comment.topic
                        ) {
                            return (
                                <div key={i} className="commentContainer">
                                    {edit !== i && showComment(comment) && (
                                        <div className="commentDiv">
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    justifyContent:
                                                        'space-between',
                                                    gap: '20px',
                                                }}
                                            >
                                                <div>
                                                    <span
                                                        style={{
                                                            fontWeight: 'bold',
                                                        }}
                                                    >
                                                        {comment.user.name}
                                                    </span>{' '}
                                                    - &nbsp;
                                                    <span
                                                        style={{
                                                            fontSize: 'smaller',
                                                            fontStyle: 'italic',
                                                        }}
                                                    >
                                                        {formatDateTime(
                                                            comment.date
                                                        )}
                                                    </span>
                                                    {comment.edited &&
                                                        comment.edited.length >
                                                            0 && (
                                                            <Tooltip
                                                                title={getTooltipTitle(
                                                                    comment
                                                                )}
                                                            >
                                                                <span>
                                                                    &nbsp;
                                                                    (Edited)
                                                                </span>
                                                            </Tooltip>
                                                        )}
                                                    <div>
                                                        {parse(comment.text)}
                                                    </div>
                                                </div>
                                                {(editMode ||
                                                    comment.user.email ===
                                                        context.user.email) && (
                                                    <div
                                                        className="commentDeleteButton"
                                                        style={{
                                                            display: 'flex',
                                                            flexDirection:
                                                                'column',
                                                        }}
                                                    >
                                                        {/* <Checkbox
                                            checked={comment.private}
                                            onChange={(event) => togglePrivate(i, event)}
                                            label="Private"
                                        /> */}
                                                        <Button
                                                            style={{
                                                                marginBottom:
                                                                    '8px',
                                                            }}
                                                            onClick={event =>
                                                                showEditor(
                                                                    i,
                                                                    event
                                                                )
                                                            }
                                                        >
                                                            Edit
                                                        </Button>
                                                        <Button
                                                            onClick={() =>
                                                                deleteComment(
                                                                    comment.id ||
                                                                        i
                                                                )
                                                            }
                                                        >
                                                            Delete
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    <div className="commentContainerForEditor"></div>
                                </div>
                            );
                        }
                        return null;
                    })}
                </>
            )}

            {document.comments.length === 0 && <div>None</div>}

            <div ref={commentEditorContainer}>
                <div
                    ref={commentEditor}
                    style={{ display: edit >= 0 ? 'block' : 'none' }}
                    className="commentDiv"
                >
                    Edit Comment:
                    <div className="editorDiv">
                        <EditorContainer
                            id="comment"
                            data={data}
                            setData={setData}
                            editMode={true}
                            onBlur={onBlurEdit}
                            uploadImageCallback={uploadImageCallback}
                            setError={context.setError}
                        />
                        <Button onClick={() => updateComment()}>
                            Save Comment
                        </Button>{' '}
                        &nbsp;
                        <Button onClick={() => setEdit(-1)}>Cancel</Button>
                    </div>
                </div>
            </div>

            {canAddComment && (
                <div>
                    <div>&nbsp;</div>
                    New Comment:
                    <div className="editorDiv">
                        <EditorContainer
                            id="comment"
                            data={newComment}
                            setData={setNewComment}
                            editMode={true}
                            onBlur={onBlur}
                            uploadImageCallback={uploadImageCallback}
                            setError={context.setError}
                        />
                        <Button onClick={addComment}>Add Comment</Button> &nbsp;
                        {/* <Checkbox
                    checked={newCommentPrivate}
                    onChange={(event) => toggleNewCommentPrivate(event)}
                    label="Private"
                /> */}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Comments;
