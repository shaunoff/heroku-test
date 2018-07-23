import axios from 'axios'

export default axios.create({
  baseURL: 'https://firestore.googleapis.com/v1beta1/projects/promoboxx-dev/databases/(default)/documents/'
})
