import { OpenAI } from 'openai'
import dotenv from 'dotenv'
import saveData from '../models/save.js'
import { StatusCodes } from 'http-status-codes'
// 載入 .env 檔案
dotenv.config()

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export const aiApi = async (req, res) => {
  try {
    const { question, selectedCards } = req.body
    const cardName = selectedCards.map((card) => card.name).join(', ')

    const messages = [
      {
        role: 'system',
        content:
          '你是專業的塔羅牌老師，解讀的最後還會給予他們建議，做出專業的解讀，收到什麼語言用麼語言回復。',
      },
      {
        role: 'user',
        content: `${question}\n${cardName}`,
      },
    ]
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
      temperature: 1,
    })
    // console.log(response)

    // console.log(response.choices[0].message.content)
    res.json({ result: response.choices[0].message.content })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: '调用 OpenAI API 失败' })
  }
}

export const apiSave = async (req, res) => {
  try {
    const { question, selectedCards, aiResponse } = req.body
    const userId = req.user.id // 從 `auth.jwt` 解析出來的使用者 ID

    // 資料完整性檢查
    if (!question || !selectedCards || !aiResponse) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: '請提供完整的占卜記錄' })
    }

    // 建立占卜記錄
    const newSave = new saveData({
      user: userId,
      question,
      selectedCards,
      aiResponse,
    })
    await newSave.save()

    // 回傳成功訊息
    res.status(StatusCodes.CREATED).json({ message: '占卜記錄已保存！' })
  } catch (error) {
    console.error('儲存失敗:', error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: '伺服器錯誤，請稍後再試' })
  }
}

export const aiBooking = async (req, res) => {
  try {
    // 從資料庫獲取所有保存的塔羅紀錄
    const tarotRecords = await saveData.find({ user: req.user.id })
    // 回傳成功的結果
    res.status(200).json({
      result: tarotRecords,
    })
  } catch (error) {
    console.error('無法獲取資料:', error)
    res.status(500).json({ error: '無法獲取資料' })
  }
}
export const deleteRecord = async (req, res) => {
  try {
    const { id } = req.params // 從路由參數中獲取 ID

    // 查找並刪除該紀錄
    const deletedRecord = await saveData.findByIdAndDelete(id)

    if (!deletedRecord) {
      return res.status(StatusCodes.NOT_FOUND).json({ error: '找不到該紀錄' })
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: '紀錄已成功刪除',
    })
  } catch (error) {
    console.error('刪除紀錄錯誤:', error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: '伺服器錯誤，無法刪除紀錄' })
  }
}
