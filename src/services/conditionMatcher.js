// Lightweight “training-style” condition matcher for eye images
// It can either:
//  - Use a custom TFJS model exported from offline training at /public/models/eye-condition/model.json
//  - Or fall back to Mobilenet + curated samples from /public/Original Dataset

import * as tf from '@tensorflow/tfjs'
import * as mobilenet from '@tensorflow-models/mobilenet'

// Curated sample from your folders so we don’t have to list thousands of files in JSON.
// You can expand this list with more filenames if you like.
const DATASET_SAMPLES = [
  // Healthy
  { id: 'healthy-1', label: 'Healthy eye', src: '/Original Dataset/Healthy/Healthy1.jpg' },
  { id: 'healthy-2', label: 'Healthy eye', src: '/Original Dataset/Healthy/Healthy2.jpg' },
  { id: 'healthy-3', label: 'Healthy eye', src: '/Original Dataset/Healthy/Healthy10.jpg' },
  { id: 'healthy-4', label: 'Healthy eye', src: '/Original Dataset/Healthy/Healthy20.jpg' },

  // Myopia
  { id: 'myopia-1', label: 'Myopia', src: '/Original Dataset/Myopia/Myopia1.jpg' },
  { id: 'myopia-2', label: 'Myopia', src: '/Original Dataset/Myopia/Myopia2.jpg' },
  { id: 'myopia-3', label: 'Myopia', src: '/Original Dataset/Myopia/Myopia10.jpg' },
  { id: 'myopia-4', label: 'Myopia', src: '/Original Dataset/Myopia/Myopia20.jpg' },

  // Glaucoma
  { id: 'glaucoma-1', label: 'Glaucoma', src: '/Original Dataset/Glaucoma/Glaucoma1.jpg' },
  { id: 'glaucoma-2', label: 'Glaucoma', src: '/Original Dataset/Glaucoma/Glaucoma2.jpg' },
  { id: 'glaucoma-3', label: 'Glaucoma', src: '/Original Dataset/Glaucoma/Glaucoma10.jpg' },
  { id: 'glaucoma-4', label: 'Glaucoma', src: '/Original Dataset/Glaucoma/Glaucoma20.jpg' },

  // Diabetic Retinopathy
  { id: 'dr-1', label: 'Diabetic retinopathy', src: '/Original Dataset/Diabetic Retinopathy/DR1.jpg' },
  { id: 'dr-2', label: 'Diabetic retinopathy', src: '/Original Dataset/Diabetic Retinopathy/DR2.jpg' },
  { id: 'dr-3', label: 'Diabetic retinopathy', src: '/Original Dataset/Diabetic Retinopathy/DR10.jpg' },
  { id: 'dr-4', label: 'Diabetic retinopathy', src: '/Original Dataset/Diabetic Retinopathy/DR20.jpg' },

  // Central Serous Chorioretinopathy (CSCR)
  {
    id: 'cscr-1',
    label: 'Central serous chorioretinopathy',
    src: '/Original Dataset/Central Serous Chorioretinopathy [Color Fundus]/CSCR1.jpg'
  },
  {
    id: 'cscr-2',
    label: 'Central serous chorioretinopathy',
    src: '/Original Dataset/Central Serous Chorioretinopathy [Color Fundus]/CSCR2.jpg'
  },
  {
    id: 'cscr-3',
    label: 'Central serous chorioretinopathy',
    src: '/Original Dataset/Central Serous Chorioretinopathy [Color Fundus]/CSCR10.jpg'
  }
]

class ConditionMatcher {
  constructor() {
    this.modelPromise = null
    this.customModelPromise = null
    this.useCustomModel = false
    this.datasetEmbeddings = []
    this.datasetMeta = []
    this.initialized = false
  }

  async init() {
    if (this.initialized) return

    await tf.ready()
    // Try to load custom TFJS model first
    if (!this.customModelPromise) {
      try {
        this.customModelPromise = tf.loadLayersModel('/models/eye-condition/model.json')
        this.useCustomModel = true
        console.log('ConditionMatcher: loaded custom eye-condition model')
      } catch (err) {
        console.warn('ConditionMatcher: custom model not found, falling back to MobileNet', err)
        this.customModelPromise = null
        this.useCustomModel = false
      }
    }

    if (!this.useCustomModel && !this.modelPromise) {
      this.modelPromise = mobilenet.load({ version: 2, alpha: 0.5 })
    }

    const model = this.useCustomModel
      ? await this.customModelPromise
      : await this.modelPromise

    const embeddings = []
    const meta = []

    for (const entry of DATASET_SAMPLES) {
      try {
        const img = await this.loadImage(entry.src)
        const embedding = await this.extractEmbedding(model, img)
        embeddings.push(embedding)
        meta.push({
          id: entry.id,
          label: entry.label,
          src: entry.src
        })
      } catch (err) {
        console.warn('ConditionMatcher: failed to process dataset image', entry, err)
      }
    }

    this.datasetEmbeddings = embeddings
    this.datasetMeta = meta
    this.initialized = true
  }

  async loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = src
    })
  }

  async extractEmbedding(model, img) {
    // Convert image to tensor
    const input = tf.tidy(() => {
      let tensor = tf.browser.fromPixels(img).toFloat()
      const resized = tf.image.resizeBilinear(tensor, [224, 224], true)
      const offset = tf.scalar(127.5)
      const normalized = resized.sub(offset).div(offset)
      tensor.dispose?.()
      return normalized.expandDims(0)
    })

    let embedding

    if (this.useCustomModel) {
      // Use logits/probabilities from the custom model as the embedding
      const logits = model.predict(input)
      embedding = tf.tidy(() => logits.squeeze())
      logits.dispose()
      input.dispose()
    } else {
      // Mobilenet feature extractor
      const mobFeatures = await model.infer(input, true)
      const pooled = tf.tidy(() => {
        const mean = mobFeatures.mean([1, 2])
        return mean.squeeze()
      })
      input.dispose()
      mobFeatures.dispose()
      embedding = pooled
    }

    return embedding
  }

  async matchUserSnapshot(dataUrl, topK = 3) {
    if (!dataUrl) return { matches: [], usedDataset: false }

    await this.init()
    if (!this.datasetEmbeddings.length) {
      return { matches: [], usedDataset: false }
    }

    const model = await this.modelPromise
    const img = await this.loadImage(dataUrl)
    const userEmbedding = await this.extractEmbedding(model, img)

    const similarities = this.datasetEmbeddings.map((emb, index) => {
      const sim = this.cosineSimilarity(userEmbedding, emb)
      return {
        similarity: sim,
        ...this.datasetMeta[index]
      }
    })

    // Clean up user embedding
    userEmbedding.dispose()

    similarities.sort((a, b) => b.similarity - a.similarity)
    const matches = similarities.slice(0, topK)

    const formattedMatches = matches.map(m => ({
      id: m.id,
      label: m.label,
      src: m.src,
      similarity: Number(m.similarity.toFixed(3))
    }))

    // Simple continual learning:
    // - If the best match is very confident, treat this user eye as an extra example
    //   of that condition (kept in memory for this session).
    if (formattedMatches.length > 0 && formattedMatches[0].similarity >= 0.9) {
      const best = formattedMatches[0]
      // Keep an extra embedding tied to the same condition label
      this.datasetEmbeddings.push(userEmbedding.clone())
      this.datasetMeta.push({
        id: `${best.id}-user-${Date.now()}`,
        label: best.label,
        src: best.src
      })
    } else {
      // If not confident, we still dispose userEmbedding later; do not learn from it
    }

    // If even the best similarity is low, surface this as "uncertain pattern"
    // so the app can show that the eye does not clearly match any known class.
    const isUncertain = formattedMatches.length === 0 || formattedMatches[0].similarity < 0.6
    if (isUncertain) {
      formattedMatches.unshift({
        id: 'unknown',
        label: 'Uncertain / atypical pattern',
        src: null,
        similarity: formattedMatches[0]?.similarity ?? 0
      })
    }

    // Clean up user embedding (we cloned it above if we needed to keep a copy)
    userEmbedding.dispose()

    return {
      matches: formattedMatches,
      usedDataset: true,
      uncertain: isUncertain
    }
  }

  cosineSimilarity(a, b) {
    return tf.tidy(() => {
      const aNorm = tf.norm(a)
      const bNorm = tf.norm(b)
      const dot = tf.sum(tf.mul(a, b))
      const sim = dot.div(aNorm.mul(bNorm)).dataSync()[0]
      return sim
    })
  }
}

const conditionMatcher = new ConditionMatcher()
export default conditionMatcher


