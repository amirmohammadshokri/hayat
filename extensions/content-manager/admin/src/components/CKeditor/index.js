import React from 'react';
import PropTypes from 'prop-types';

// import CKEditor from '@ckeditor/ckeditor5-react';
// import ClassicEditor from './build/ckeditor';
import '../customClassicCKEditor/ckeditor';
// import ClassicEditor from 'ckeditor-build-with-simple-upload-provider-strapi-with-image-resize';
import styled from 'styled-components';
// import { auth } from 'strapi-helper-plugin';


class CKEditor extends React.Component {
	constructor( props ) {
		super( props );

		// After mounting the editor, the variable will contain a reference to the created editor.
		// @see: https://ckeditor.com/docs/ckeditor5/latest/api/module_core_editor_editor-Editor.html
		this.editor = null;
		this.domContainer = React.createRef();
	}

	// This component should never be updated by React itself.
	shouldComponentUpdate( nextProps ) {
		if ( !this.editor ) {
			return false;
		}

		if ( this._shouldUpdateContent( nextProps ) ) {
			this.editor.setData( nextProps.data );
		}

		if ( 'disabled' in nextProps ) {
			this.editor.isReadOnly = nextProps.disabled;
		}

		return false;
	}

	// Initialize the editor when the component is mounted.
	componentDidMount() {
		this._initializeEditor();
	}

	// Destroy the editor before unmouting the component.
	componentWillUnmount() {
		this._destroyEditor();
	}

	// Render a <div> element which will be replaced by CKEditor.
	render() {
		// We need to inject initial data to the container where the editable will be enabled. Using `editor.setData()`
		// is a bad practice because it initializes the data after every new connection (in case of collaboration usage).
		// It leads to reset the entire content. See: #68
		return (
			<div ref={ this.domContainer } dangerouslySetInnerHTML={ { __html: this.props.data || '' } }></div>
		);
	}

	_initializeEditor() {
    console.log(ClassicEditor)
		ClassicEditor.create( this.domContainer.current , this.props.config )
			.then( editor => {
				this.editor = editor;

				if ( 'disabled' in this.props ) {
					editor.isReadOnly = this.props.disabled;
				}

				if ( this.props.onInit ) {
					this.props.onInit( editor );
				}

				const modelDocument = editor.model.document;
				const viewDocument = editor.editing.view.document;

				modelDocument.on( 'change:data', event => {
					/* istanbul ignore else */
					if ( this.props.onChange ) {
						this.props.onChange( event, editor );
					}
				} );

				viewDocument.on( 'focus', event => {
					/* istanbul ignore else */
					if ( this.props.onFocus ) {
						this.props.onFocus( event, editor );
					}
				} );

				viewDocument.on( 'blur', event => {
					/* istanbul ignore else */
					if ( this.props.onBlur ) {
						this.props.onBlur( event, editor );
					}
				} );
			} )
			.catch( error => {
				const onErrorCallback = this.props.onError || console.error;

				onErrorCallback( error );
			} );
	}

	_destroyEditor() {
		if ( this.editor ) {
			this.editor.destroy()
				.then( () => {
					this.editor = null;
				} );
		}
	}

	_shouldUpdateContent( nextProps ) {
		// Check whether `nextProps.data` is equal to `this.props.data` is required if somebody defined the `#data`
		// property as a static string and updated a state of component when the editor's content has been changed.
		// If we avoid checking those properties, the editor's content will back to the initial value because
		// the state has been changed and React will call this method.
		if ( this.props.data === nextProps.data ) {
			return false;
		}

		// We should not change data if the editor's content is equal to the `#data` property.
		if ( this.editor.getData() === nextProps.data ) {
			return false;
		}

		return true;
	}
}

// Properties definition.
CKEditor.propTypes = {
	editor: PropTypes.func,//.isRequired,
	data: PropTypes.string,
	config: PropTypes.object,
	onChange: PropTypes.func,
	onInit: PropTypes.func,
	onFocus: PropTypes.func,
	onBlur: PropTypes.func,
	onError: PropTypes.func,
	disabled: PropTypes.bool
};

// Default values for non-required properties.
CKEditor.defaultProps = {
	config: {}
};


const Wrapper = styled.div`
  .ck-editor__main {
    min-height: 200px;
    > div {
      min-height: 200px;
    }
  }
`;

const Editor = ({ onChange, name, value }) => {

  // const jwtToken = auth.getToken();

  return (
    <Wrapper>
    <CKEditor
  editor={ClassicEditor}
  data={value}
  onChange={(event, editor) => {
    console.log( Array.from( editor.ui.componentFactory.names() ) ); // log available items
    const data = editor.getData();
    onChange({ target: { name, value: data } });
  }}
  config={{
	  language: {
		  ui: 'en',
		  content: 'fa'
	  }
  }}
  />
  </Wrapper>
);
};

Editor.propTypes = {
  onChange: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
};

export default Editor;