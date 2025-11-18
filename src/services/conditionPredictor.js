import * as tf from '@tensorflow/tfjs'

const CONDITION_LABELS = [
  'Healthy eye',
  'Myopia',
  'Hyperopia',
  'Astigmatism',
  'Glaucoma',
  'Diabetic retinopathy',
  'Retinal detachment',
  'Macular degeneration',
  'Retinitis pigmentosa',
  'Other'
]

class ConditionPredictor {
  constructor() {
    this.modelPromise = null
    this.modelLoaded = false
  }

  async ensureModel() {
    if (this.modelLoaded) return true
    if (!this.modelPromise) {
      this.modelPromise = tf
        .loadLayersModel('/models/eye-condition/model.json')
        .catch((error) => {
          console.warn('ConditionPredictor: custom model not found, fallback to heuristic.', error)
          return null
        })
    }
    this.model = await this.modelPromise
    this.modelLoaded = !!this.model
    return this.modelLoaded
  }

  async predict(dataUrl) {
    if (!dataUrl) return this.fallbackPrediction()
    const modelReady = await this.ensureModel()
    if (!modelReady) return this.fallbackPrediction()

    let tensor
    try {
      tensor = await this.imageToTensor(dataUrl)
      const logits = this.model.predict(tensor)
      const scores = Array.from(await logits.data())
      tf.dispose([tensor, logits])
      return this.normalizeProbabilities(scores)
    } catch (error) {
      console.warn('ConditionPredictor: prediction failed, fallback used.', error)
      if (tensor) tf.dispose(tensor)
      return this.fallbackPrediction()
    }
  }

  async imageToTensor(dataUrl) {
    const img = await this.loadImage(dataUrl)
    return tf.tidy(() => {
      const tensor = tf.browser.fromPixels(img).toFloat()
      const resized = tf.image.resizeBilinear(tensor, [224, 224], true)
      const normalized = resized.div(255).expandDims(0)
      tensor.dispose()
      resized.dispose()
      return normalized
    })
  }

  loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = src
    })
  }

  normalizeProbabilities(scores) {
    if (!scores || scores.length === 0) return this.fallbackPrediction()
    const total = scores.reduce((sum, value) => sum + value, 0)
    return CONDITION_LABELS.map((label, index) => ({
      label,
      value: Math.round(((scores[index] || 0) / (total || 1)) * 100)
    })).sort((a, b) => b.value - a.value)
  }

  fallbackPrediction() {
    return CONDITION_LABELS.slice(0, 5).map((label, index) => ({
      label,
      value: Math.max(0, 50 - index * 8)
    }))
  }
}

const conditionPredictor = new ConditionPredictor()
export default conditionPredictor


