import { useState } from 'react';
import { Header } from '@/components/Header';
import { useMailStore } from '@/store/mailStore';
import { Email, ToneType } from '@/types';
import { FileEdit, Send, Save, Eye, Languages, Sparkles, AlertTriangle, CheckCircle, Paperclip, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const toneOptions: { value: ToneType; label: string; description: string }[] = [
  { value: 'formal', label: '正式', description: '专业商务风格' },
  { value: 'friendly', label: '友好', description: '亲切随和' },
  { value: 'urgent', label: '催促', description: '紧迫有力' },
  { value: 'professional', label: '专业', description: '专业严谨' },
];

export function ComposePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { templates, contacts } = useMailStore();
  const originalEmail = location.state?.email as Email | undefined;

  const [to, setTo] = useState(originalEmail ? contacts.find(c => c.id === originalEmail.contactId)?.email || '' : '');
  const [subject, setSubject] = useState(originalEmail ? `回复: ${originalEmail.subject}` : '');
  const [content, setContent] = useState('');
  const [tone, setTone] = useState<ToneType>('professional');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isChinese, setIsChinese] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [needsApproval, setNeedsApproval] = useState(false);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [checkResults, setCheckResults] = useState<{ greeting: boolean; attachment: boolean }>({ greeting: true, attachment: true });

  const generateReply = async () => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const replies: Record<ToneType, string> = {
      formal: `尊敬的${originalEmail?.entities.customerName || '客户'}：

您好！

关于您邮件中提到的${originalEmail?.entities.product || '事宜'}，我们非常重视。

${originalEmail?.intent === '报价' ? `根据您的需求，我们为您提供以下报价：
- 产品：${originalEmail?.entities.product}
- 数量：${originalEmail?.entities.amount}
- 总价：${(originalEmail?.entities.amount || 0) * 50}元

请确认是否接受此报价。` : ''}

${originalEmail?.intent === '投诉' ? `非常抱歉给您带来不便。我们已收到您的反馈，正在紧急处理中。
我们会在24小时内给出解决方案，请您耐心等待。` : ''}

${originalEmail?.intent === '咨询' ? `关于您的咨询，我们已准备好相关资料。
附件中包含详细的技术文档，请查收。` : ''}

${originalEmail?.intent === '催办' ? `已收到您的催促，我们正在加急处理合同审批。
预计明天中午前完成，请您放心。` : ''}

如有任何疑问，请随时联系我。

此致
张三`,
      friendly: `Hi ${originalEmail?.entities.customerName || '朋友'}！

收到您的邮件啦~

${originalEmail?.intent === '报价' ? `关于${originalEmail?.entities.product}的价格，我们给您申请了优惠价哦！
1000件的话每件只要50元，总共50000元，划算吧！😉` : ''}

${originalEmail?.intent === '投诉' ? `哎呀，非常抱歉给您添麻烦了！我们已经在处理啦，保证给您一个满意的答复！` : ''}

${originalEmail?.intent === '咨询' ? `关于API集成的问题，我整理了详细文档发给您，有问题随时问我哈！` : ''}

${originalEmail?.intent === '催办' ? `收到收到！合同审批我已经催法务部门了，应该明天就能搞定！` : ''}

等您回复哦~

张三`,
      urgent: `${originalEmail?.entities.customerName || '客户'}：

紧急通知！

${originalEmail?.intent === '报价' ? `关于${originalEmail?.entities.product}报价，由于库存紧张，请尽快确认！
报价有效期至${originalEmail?.entities.deadline}。` : ''}

${originalEmail?.intent === '投诉' ? `关于您反馈的质量问题，我们已紧急处理！
解决方案将于今日18:00前发送，请密切关注邮件。` : ''}

${originalEmail?.intent === '咨询' ? `关于您的技术咨询，时间紧迫，请尽快确认需求细节！` : ''}

${originalEmail?.intent === '催办' ? `合同审批已加急处理中！
预计今日12:00前完成，请保持电话畅通。` : ''}

请尽快回复！

张三`,
      professional: `尊敬的${originalEmail?.entities.customerName || '客户'}：

感谢您的来信。

针对您提出的${originalEmail?.intent === '报价' ? '报价请求' : originalEmail?.intent === '投诉' ? '投诉事项' : originalEmail?.intent === '咨询' ? '咨询问题' : '需求'}，我们进行了认真研究。

${originalEmail?.intent === '报价' ? `经核算，${originalEmail?.entities.product}的报价如下：
- 单价：50元/件
- 数量：${originalEmail?.entities.amount}件
- 合计：${(originalEmail?.entities.amount || 0) * 50}元

付款方式：预付30%，发货前付清余款。` : ''}

${originalEmail?.intent === '投诉' ? `经初步调查，问题原因已确认。我们将在3个工作日内提供完整解决方案，并安排专人跟进。` : ''}

${originalEmail?.intent === '咨询' ? `附件为您所需的技术文档，包含API接口规范、集成示例代码及常见问题解答。` : ''}

${originalEmail?.intent === '催办' ? `合同审批流程已进入最后阶段，预计明日完成。审批完成后将立即通知您。` : ''}

如有任何疑问，请随时与我联系。

此致
敬礼
张三`,
    };

    setContent(replies[tone]);
    setIsGenerating(false);
  };

  const rewriteContent = async () => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (isChinese) {
      setContent(content.replace(/尊敬的/g, '亲爱的').replace(/此致/g, '祝好').replace(/敬礼/g, ''));
    } else {
      const englishContent = `Dear ${originalEmail?.entities.customerName || 'Customer'},

Thank you for your email regarding ${originalEmail?.entities.product || 'your inquiry'}.

${originalEmail?.intent === '报价' ? `We are pleased to provide the following quotation:
- Product: ${originalEmail?.entities.product}
- Quantity: ${originalEmail?.entities.amount}
- Total: ${(originalEmail?.entities.amount || 0) * 50} CNY

Please confirm if you accept this offer.` : ''}

${originalEmail?.intent === '投诉' ? `We sincerely apologize for the inconvenience caused. Our team is investigating the issue and will provide a resolution within 24 hours.` : ''}

${originalEmail?.intent === '咨询' ? `Please find attached the technical documentation you requested. Let me know if you need further clarification.` : ''}

${originalEmail?.intent === '催办' ? `We are expediting the contract approval process. It should be completed by tomorrow noon.` : ''}

Best regards,
Zhang San`;
      setContent(englishContent);
    }
    setIsGenerating(false);
  };

  const checkContent = () => {
    const hasGreeting = content.includes('尊敬') || content.includes('Dear') || content.includes('Hi') || content.includes('你好');
    setCheckResults({
      greeting: hasGreeting,
      attachment: attachments.length > 0,
    });
  };

  const handleSend = () => {
    if (needsApproval) {
      alert('邮件已提交审批，请等待审批通过后发送');
    } else {
      alert('邮件已发送！');
      navigate('/');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newAttachments = Array.from(files).map(f => f.name);
      setAttachments([...attachments, ...newAttachments]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="智能写信" />
      
      <div className="p-6">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-blue-500" />
                <span className="font-medium text-gray-900">AI助手</span>
              </div>

              <div className="space-y-3">
                <button
                  onClick={generateReply}
                  disabled={isGenerating}
                  className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  {isGenerating ? '生成中...' : '生成回复草稿'}
                </button>

                <button
                  onClick={rewriteContent}
                  disabled={!content || isGenerating}
                  className="w-full btn-outline flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Languages className="w-4 h-4" />
                  {isChinese ? '翻译成英文' : '翻译成中文'}
                </button>

                <button
                  onClick={checkContent}
                  disabled={!content}
                  className="w-full btn-secondary flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Eye className="w-4 h-4" />
                  检查内容
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
              <p className="font-medium text-gray-900 mb-4">语气选择</p>
              <div className="space-y-2">
                {toneOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setTone(option.value)}
                    className={`w-full p-3 rounded-lg text-left transition-all duration-200 ${
                      tone === option.value
                        ? 'bg-blue-50 border-2 border-blue-500'
                        : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                    }`}
                  >
                    <p className="font-medium text-gray-900">{option.label}</p>
                    <p className="text-xs text-gray-500">{option.description}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <p className="font-medium text-gray-900 mb-4">常用模板</p>
              <div className="space-y-2">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setContent(template.content)}
                    className="w-full p-3 rounded-lg text-left bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <p className="font-medium text-gray-900 text-sm">{template.name}</p>
                    <p className="text-xs text-gray-500">{template.category}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-9">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">收件人</span>
                  </div>
                  <input
                    type="email"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className="input-field w-64"
                    placeholder="输入收件人邮箱"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={needsApproval}
                      onChange={(e) => setNeedsApproval(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600">需要审批</span>
                  </label>
                </div>
              </div>

              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">主题</span>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="flex-1 input-field"
                    placeholder="输入邮件主题"
                  />
                </div>
              </div>

              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Paperclip className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="w-40 pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm opacity-0 absolute inset-0 cursor-pointer"
                      style={{ opacity: 0 }}
                    />
                    <button className="btn-secondary">
                      <Paperclip className="w-4 h-4 mr-2" />
                      添加附件
                    </button>
                  </div>
                  {attachments.length > 0 && (
                    <div className="flex items-center gap-2">
                      {attachments.map((file, index) => (
                        <span key={index} className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm">
                          {file}
                          <button onClick={() => removeAttachment(index)} className="hover:text-red-500">×</button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {checkResults.greeting === false || checkResults.attachment === false ? (
                <div className="p-4 bg-amber-50 border-t border-amber-100">
                  <div className="flex items-center gap-2 text-amber-700">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="text-sm">
                      {!checkResults.greeting && '提醒：邮件中未发现称呼，请确认是否遗漏。'}
                      {!checkResults.greeting && !checkResults.attachment && ' | '}
                      {!checkResults.attachment && '提醒：未添加附件，是否需要添加？'}
                    </span>
                  </div>
                </div>
              ) : checkContent && content ? (
                <div className="p-4 bg-green-50 border-t border-green-100">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm">检查通过：称呼和附件均已确认</span>
                  </div>
                </div>
              ) : null}

              {showPreview ? (
                <div className="p-6 bg-gray-50 min-h-[400px]">
                  <pre className="whitespace-pre-wrap text-gray-700 font-sans leading-relaxed">{content}</pre>
                </div>
              ) : (
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full p-6 min-h-[400px] resize-none focus:outline-none text-gray-700 font-sans leading-relaxed"
                  placeholder="开始撰写邮件...或者点击右侧AI助手生成回复"
                />
              )}

              <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button onClick={() => setShowPreview(!showPreview)} className="btn-secondary flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    {showPreview ? '编辑模式' : '预览'}
                  </button>
                  <button className="btn-secondary flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    保存草稿
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button className="btn-outline flex items-center gap-2">
                    <FileEdit className="w-4 h-4" />
                    取消
                  </button>
                  <button
                    onClick={handleSend}
                    disabled={!to || !subject || !content}
                    className="btn-primary flex items-center gap-2 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    {needsApproval ? '提交审批' : '发送'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
