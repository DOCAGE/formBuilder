import controlTextarea from './textarea'

/**
 * TinyMCE editor element
 * See https://www.tinymce.com/ for more info
 *
 * To customise the options on this editor, simply pass any properties you wish to overwrite in the controlConfig option to formRender
 * e.g. the below example would disable the ability to paste images as a base64 encoded src
 * ```
 * var renderOpts = {
 *    controlConfig: {
 *      'textarea.tinymce': {
 *         paste_data_images: false
 *       }
 *    }
 * };
 * ```
 */
export default class controlTinymce extends controlTextarea {
  /**
   * configure the tinymce editor requirements
   */
  configure() {
      this.js = ['https://cdnjs.cloudflare.com/ajax/libs/tinymce/4.9.11/tinymce.min.js']

    // additional javascript config
    if (this.classConfig.js) {
      let js = this.classConfig.js
      if (!Array.isArray(js)) {
        js = new Array(js)
      }
      this.js.concat(js)
      delete this.classConfig.js
    }

    // additional css config
    if (this.classConfig.css) {
      this.css = this.classConfig.css
    }

    // configure the tinyMCE editor defaults
    this.editorOptions = {
      height: 250,
      paste_data_images: true,
      plugins: [
        'advlist autolink lists link image charmap print preview anchor',
        'searchreplace visualblocks code fullscreen',
        'insertdatetime media table contextmenu paste code',
      ],
      toolbar:
        'undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | table',
    }
  }

  /**
   * build a textarea DOM element, to be later replaced by the TinyMCE editor
   * @return {Object} DOM Element to be injected into the form.
   */
  build() {
    const { value = '', ...attrs } = this.config
    //Textareas do not have an attribute 'type'
    delete attrs['type']
    this.field = this.markup('textarea', this.parsedHtml(value), attrs)
    // Make the editor read only if disabled is set on the textarea
    if (attrs.disabled) {
      this.editorOptions.readonly = true
    }
    return this.field
  }

  /**
   * When the element is rendered into the DOM, execute the following code to initialise it
   * @param {Object} evt - event
   */
    onRender(evt) {
    if (window.tinymce.editors[this.id]) {
      window.tinymce.editors[this.id].remove()
    }

    // define options & allow them to be overwritten in the class config
    const options = jQuery.extend(this.editorOptions, this.classConfig)

    options.init_instance_callback = function (inst) {
        // after editor is initialized use the textarea user data to set the contents
        inst.setContent($('[name="' + inst.id + '"]').attr('user-data'))
        // if the textarea is disabled then the editor should be as well (display form rather than edit)
        if ($('[name="' + inst.id + '"]').attr('disabled') == 'disabled') {
            inst.getBody().setAttribute('contenteditable', 'false')
        }
    }

    options.target = this.field

    setTimeout(() => {
      // initialise the editor
      window.tinymce.init(options)
    }, 100)

    return evt
  }
}

// register tinymce as a richtext control
controlTextarea.register('tinymce', controlTinymce, 'textarea')
