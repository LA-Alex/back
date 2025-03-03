import { Schema, model, ObjectId } from 'mongoose'

const schema = new Schema(
  {
    user: {
      type: ObjectId,
      ref: 'users',
      required: [true, 'orderUserRequired'],
    },
    question: {
      type: String,
      require: true,
    },
    selectedCards: {
      type: Array,
      require: true,
    },
    aiResponse: {
      type: String,
      require: true,
    },
  },
  {
    timestamps: true,
  },
)

export default model('saveData', schema)
