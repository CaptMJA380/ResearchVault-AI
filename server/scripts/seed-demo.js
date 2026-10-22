import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Paper from '../models/Paper.js';
import ResearchCollection from '../models/ResearchCollection.js';
import { connectDB, disconnectDB } from '../config/db.js';
import { generateTextEmbedding } from '../services/aiService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const DEMO_PAPERS = [
  {
    title: 'Attention Is All You Need: Modern Transformers in Sequence Modeling',
    authors: ['Ashish Vaswani', 'Noam Shazeer', 'Niki Parmar', 'Jakob Uszkoreit'],
    publicationYear: 2017,
    journalOrVenue: 'NeurIPS 2017',
    doi: '10.48550/arXiv.1706.03762',
    abstract: 'The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely.',
    keywords: ['transformer', 'attention mechanism', 'sequence transduction', 'deep learning'],
    tags: ['nlp', 'transformers', 'deep-learning', 'foundations'],
    extractedText: 'Attention Is All You Need. Abstract: The dominant sequence transduction models are based on complex recurrent or convolutional neural networks. We propose the Transformer, based solely on attention mechanisms. Experiments on two machine translation tasks show these models to be superior in quality while being more parallelizable and requiring significantly less time to train.',
    summary: {
      overview: 'Introduces the Transformer architecture, dispensing with recurrent or convolutional neural networks entirely in favor of multi-head self-attention.',
      researchProblem: 'Recurrent models compute representations sequentially, which precludes parallel training on long sequences.',
      methodology: 'Multi-head self-attention layers with positional encodings, layer normalization, and feed-forward sub-layers across encoder and decoder stacks.',
      mainFindings: [
        'Achieved state-of-the-art BLEU score of 28.4 on WMT 2014 English-to-German translation',
        'Trained in only 3.5 days on 8 P100 GPUs, significantly faster than existing models',
        'Demonstrated effective generalization to English constituency parsing',
      ],
      limitations: [
        'Quadratic computational complexity with respect to input sequence length',
        'Requires large datasets to avoid overfitting compared to inductive biases in CNNs',
      ],
      keywords: ['self-attention', 'transformer', 'multi-head attention', 'translation'],
      generatedAt: new Date(),
      model: 'gemini-2.5-flash',
    },
    references: [
      '[1] Bahdanau, D., Cho, K., and Bengio, Y. Neural machine translation by jointly learning to align and translate. ICLR 2015.',
      '[2] Hochreiter, S. and Schmidhuber, J. Long short-term memory. Neural computation, 1997.',
      '[3] Vaswani, A. et al. Tensor2Tensor for Neural Machine Translation. CoRR 2018.',
    ],
    notes: [
      { content: 'Key reference for understanding attention head dimension scaling sqrt(d_k).' },
      { content: 'Essential paper to cite in Chapter 2 of the literature review.' },
    ],
  },
  {
    title: 'Deep Residual Learning for Image Recognition',
    authors: ['Kaiming He', 'Xiangyu Zhang', 'Shaoqing Ren', 'Jian Sun'],
    publicationYear: 2016,
    journalOrVenue: 'IEEE CVPR 2016',
    doi: '10.1109/CVPR.2016.90',
    abstract: 'Deeper neural networks are more difficult to train. We present a residual learning framework to ease the training of networks that are substantially deeper than those used previously. We explicitly reformulate the layers as learning residual functions with reference to the layer inputs, instead of learning unreferenced functions.',
    keywords: ['resnet', 'computer vision', 'residual connections', 'convolutional neural networks'],
    tags: ['computer-vision', 'deep-learning', 'cnns'],
    extractedText: 'Deep Residual Learning for Image Recognition. Abstract: We present a residual learning framework to ease the training of networks that are substantially deeper than those used previously. On the ImageNet dataset, we evaluate residual nets with a depth of up to 152 layers—8x deeper than VGG nets but still having lower complexity.',
    summary: {
      overview: 'Presents ResNet, introducing shortcut identity connections to address the degradation problem in extremely deep neural networks.',
      researchProblem: 'As neural networks become deeper, accuracy saturates and then degrades rapidly due to vanishing/exploding gradients and optimization difficulties.',
      methodology: 'Residual mapping F(x) = H(x) - x implemented via skip connections that perform identity mapping without adding extra parameters.',
      mainFindings: [
        'Enabled training of 152-layer networks on ImageNet, winning 1st place in ILSVRC 2015',
        'Achieved 3.57% top-5 error rate on ImageNet test set',
        'Proved that residual learning simplifies optimization across vision tasks including detection and segmentation',
      ],
      limitations: [
        'Requires careful tuning of batch normalization parameters across deep stacks',
        'Increased memory consumption during training backpropagation passes',
      ],
      keywords: ['skip connections', 'residual learning', 'resnet', 'imagenet'],
      generatedAt: new Date(),
      model: 'gemini-2.5-flash',
    },
    references: [
      '[1] LeCun, Y. et al. Gradient-based learning applied to document recognition. Proc. IEEE 1998.',
      '[2] Simonyan, K. and Zisserman, A. Very deep convolutional networks for large-scale image recognition. ICLR 2015.',
      '[3] Szegedy, C. et al. Going deeper with convolutions. CVPR 2015.',
    ],
    notes: [
      { content: 'Identity skip connections solve degradation without parameter inflation.' },
    ],
  },
  {
    title: 'Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks',
    authors: ['Patrick Lewis', 'Ethan Perez', 'Aleksandra Piktus', 'Fabio Petroni'],
    publicationYear: 2020,
    journalOrVenue: 'NeurIPS 2020',
    doi: '10.48550/arXiv.2005.11401',
    abstract: 'Large pre-trained language models have been shown to store factual knowledge in their parameters. However, their ability to access and precisely manipulate knowledge is limited. We explore a general-purpose fine-tuning recipe for retrieval-augmented generation (RAG) — models which combine pre-trained parametric and non-parametric memory.',
    keywords: ['rag', 'retrieval-augmented generation', 'knowledge retrieval', 'dense passage retrieval'],
    tags: ['nlp', 'rag', 'information-retrieval', 'llms'],
    extractedText: 'Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks. Abstract: We explore a general-purpose fine-tuning recipe for retrieval-augmented generation (RAG) models which combine pre-trained parametric memory (a seq2seq model) and non-parametric memory (a dense vector index of Wikipedia) accessed with a pre-trained neural retriever.',
    summary: {
      overview: 'Formulates Retrieval-Augmented Generation (RAG), pairing a parametric sequence-to-sequence generator with a non-parametric dense passage retriever.',
      researchProblem: 'Language models suffer from hallucinations and outdated knowledge because facts are frozen in parametric weights.',
      methodology: 'Dense Passage Retrieval (DPR) coupled with BART generator in end-to-end differentiable RAG-Token and RAG-Sequence architectures.',
      mainFindings: [
        'Outperformed parametric-only models on Natural Questions and TriviaQA benchmarks',
        'Generated more factual, specific, and verifiable responses than pure parametric models',
        'Enabled non-parametric index updates without retraining model parameters',
      ],
      limitations: [
        'Inference latency is higher due to vector retrieval step',
        'Retriever quality directly bottlenecks generation fidelity',
      ],
      keywords: ['dense retrieval', 'parametric memory', 'factuality', 'question answering'],
      generatedAt: new Date(),
      model: 'gemini-2.5-flash',
    },
    references: [
      '[1] Karpukhin, V. et al. Dense passage retrieval for open-domain question answering. EMNLP 2020.',
      '[2] Lewis, M. et al. BART: Denoising sequence-to-sequence pre-training. ACL 2020.',
      '[3] Guu, K. et al. REALM: Retrieval-augmented language model pre-training. ICML 2020.',
    ],
    notes: [
      { content: 'Foundational baseline for our research paper intelligence architecture.' },
    ],
  },
];

async function seed() {
  console.log('\n=== ResearchVault AI — Demo Data Seeder ===\n');

  if (!process.env.MONGODB_URI) {
    console.error('  ✗ MONGODB_URI is not set in environment or server/.env.');
    console.error('    Please configure MONGODB_URI in server/.env before seeding demo data.\n');
    process.exit(1);
  }

  const connResult = await connectDB();
  if (!connResult.success) {
    console.error(`  ✗ Database connection failed: ${connResult.error || 'Check server/.env'}\n`);
    process.exit(1);
  }

  try {
    console.log('  [Seeder] Inserting synthetic demo papers...');

    const insertedPaperIds = [];

    for (const paperData of DEMO_PAPERS) {
      // Check if paper with this title already exists to prevent duplicate spam
      let existing = await Paper.findOne({ title: paperData.title });
      if (!existing) {
        // Calculate vector embedding
        const emb = await generateTextEmbedding(`${paperData.title} ${paperData.abstract}`);
        existing = await Paper.create({
          ...paperData,
          embedding: emb.vector,
          embeddingModel: emb.model,
        });
        console.log(`    + Created paper: "${existing.title.slice(0, 45)}..."`);
      } else {
        console.log(`    • Existing paper preserved: "${existing.title.slice(0, 45)}..."`);
      }
      insertedPaperIds.push(existing._id);
    }

    // Create or update demo collection
    let collection = await ResearchCollection.findOne({ name: 'Foundations of Modern AI' });
    if (!collection) {
      collection = await ResearchCollection.create({
        name: 'Foundations of Modern AI',
        description: 'Seminal research papers on Transformer architectures, Deep ResNets, and Retrieval-Augmented Generation.',
        paperIds: insertedPaperIds,
      });
      console.log(`    + Created collection: "${collection.name}" with ${insertedPaperIds.length} papers.`);
    } else {
      collection.paperIds = Array.from(new Set([...collection.paperIds, ...insertedPaperIds]));
      await collection.save();
      console.log(`    • Collection preserved: "${collection.name}"`);
    }

    console.log('\n  ✓ Demo data seeded successfully without deleting existing user data.\n');
  } catch (err) {
    console.error('  ✗ Seeding failed:', err.message);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
}

seed();
