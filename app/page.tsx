"use client"

import { useState } from "react"

type Message = { role: string; content: string }

const API_URL = "http://localhost:8000"

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [fileReady, setFileReady] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [urlInput, setUrlInput] = useState("")

  async function uploadFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const formData = new FormData()
    formData.append("file", file)
    const res = await fetch(`${API_URL}/upload`, {
      method: "POST",
      body: formData
    })
    const data = await res.json()
    if (data.status === "success") {
      setFileReady(true)
      setMessages([{ role: "assistant", content: `✅ Ready — ${data.pages} pages, ${data.chunks} chunks` }])
    }
    setUploading(false)
  }

  async function uploadUrl() {
    if (!urlInput) return
    setUploading(true)
    const res = await fetch(`${API_URL}/upload_url`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: urlInput })
    })
    const data = await res.json()
    if (data.status === "success") {
      setFileReady(true)
      setMessages([{ role: "assistant", content: ` Ready — ${data.chunks} chunks from ${urlInput}` }])
    }
    setUploading(false)
  }

  async function sendMessage() {
    if (!input.trim() || !fileReady) return
    const userMsg: Message = { role: "user", content: input }
    setMessages(prev => [...prev, userMsg])
    setInput("")
    setLoading(true)
    const res = await fetch(`${API_URL}/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input, session_id: "user1" })
    })
    const data = await res.json()
    setMessages(prev => [...prev, { role: "assistant", content: data.answer }])
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">AI Knowledge Assistant</h1>

      <div className="w-full max-w-2xl bg-white rounded-2xl shadow p-6 mb-6">
        <p className="text-gray-600 font-medium mb-4">Upload Source</p>
        
        <label className="block mb-4">
          <span className="text-sm text-gray-500">PDF</span>
          <input type="file" accept=".pdf" onChange={uploadFile} className="block mt-1 text-sm text-gray-700" />
        </label>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="https://example.com"
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            className="flex-1 border rounded-lg px-3 py-2 text-sm"
          />
          <button
            onClick={uploadUrl}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
          >
            Upload URL
          </button>
        </div>

        {uploading && <p className="text-blue-500 text-sm mt-2">Processing...</p>}
      </div>

      <div className="w-full max-w-2xl bg-white rounded-2xl shadow flex flex-col" style={{height: "500px"}}>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl text-sm ${
                msg.role === "user" 
                  ? "bg-blue-600 text-white" 
                  : "bg-gray-100 text-gray-800"
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 px-4 py-2 rounded-2xl text-sm text-gray-500">
                Thinking...
              </div>
            </div>
          )}
        </div>

        <div className="border-t p-4 flex gap-2">
          <input
            type="text"
            placeholder={fileReady ? "Type your question..." : "Please upload a file first"}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMessage()}
            disabled={!fileReady}
            className="flex-1 border rounded-lg px-3 py-2 text-sm text-gray-900 disabled:bg-gray-50"
          />
          <button
            onClick={sendMessage}
            disabled={!fileReady || loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}