<template lang='pug'>
  section.container
    no-ssr(placeholder="Loading...")
      .widgets
        .widget(v-for='widget in landing_page_widgets')
          component(
            :is='`${widget.widget.name}_widget`'
            :widget='widget'
            :locations='locations'
            :retailer='retailer'
            )
    h3.headline {{ retailer.name }}
</template>

<script>
import _ from 'lodash'
import axios from '~/plugins/axios'

export default {
  // nuxt provides the asyncData method to retrieve and render data server-side
  // VueFire isn't available server-side, so we're using the Firestore REST API
  async asyncData ({ params }) {
    // Do we want to pre-cache all the data in Firestore using the short_url
    // token as the key? Maybe generate a compound short_url key that we can
    // parse a landing_page_id and a retailer_id from?

    const retailer = axios.get(`retailers/${params.retailer_id}`)
    const landing_page = axios.get(`landing_pages/${params.landing_page_id}`)
    const landing_page_widgets = axios.get(`landing_pages/${params.landing_page_id}/landing_page_widgets`)
    const [
      { data : retailer_response },
      { data : landing_page_response },
      { data : landing_page_widgets_response}
    ] = await Promise.all([retailer, landing_page, landing_page_widgets])
    return {
      retailer_response,
      landing_page_response,
      landing_page_widgets_response
    }
  },

  computed: {
    retailer() {
      return this.newDeserialize(this.retailer_response)
    },
    locations() {
      const locations = this.retailer.locations.values
      return locations.map(serialized => this.newDeserialize(serialized))
    },
    landing_page () {
      return this.deserialize(this.landing_page_response.fields)
    },

    landing_page_widgets() {
      let lpws = this.landing_page_widgets_response.documents

      return lpws.map(serialized => this.newDeserialize(serialized)).sort((a,b)=> + a.index - + b.index)
    }
  },

  methods: {
    newDeserialize(widget) {
      let newWidget = {}
      for (var key in widget) {
        if(typeof widget[key] === 'object'){
          if(key === 'fields' || key === 'mapValue'){
            newWidget = {...newWidget, ...this.newDeserialize(widget[key])}
          }
          else if(widget[key].mapValue){
            newWidget[key] = this.newDeserialize(widget[key].mapValue)
          }
          else {
            const nestedKey = Object.keys(widget[key])[0]
            newWidget[key] = widget[key][nestedKey]
          }
        }
        else {
          newWidget[key] = widget[key]
        }
      }
      return newWidget
    },
    deserialize (obj) {
      return _.mapValues(obj, o => {
        return _.values(o)[0]
      })
    },
    draft_content(widget) {
      const { draft_content } = widget

    },
    widget_widget(widget) {
      return this.deserialize(widget.widget.fields)
    },
    widget_content(widget) {
      return this.deserialize(widget.draft_content.fields)
    }
  }
}
</script>
