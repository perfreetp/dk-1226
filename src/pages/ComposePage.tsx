import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { useMailStore } from '@/store/mailStore';
import { Email, ToneType } from '@/types';
import { FileEdit, Send, Save, Eye, Languages, Sparkles, AlertTriangle, CheckCircle, Paperclip, User, Clock } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const toneOptions: { value: ToneType; label: string; description: string }[] = [
  { value: 'formal', label: '正式', description: '专业商务风格' },
  { value: 'friendly', label: '友好', description: '亲切随和' },
  { value: 'urgent', label: '催促', description: '紧迫有力' },
  { value: 'professional', label: '专业', description: '专业严谨' },
];

type ApprovalStatus = 'none' | 'pending' | 'approved' | 'rejected';

interface EmailDraft {
  zh: string;
  en: string;
}

export function ComposePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { templates, contacts, addTask, emails, updateEmailStatus } = useMailStore();
  const originalEmail = location.state?.email as Email | undefined;

  const [to, setTo] = useState(originalEmail ? contacts.find(c => c.id === originalEmail.contactId)?.email || '' : '');
  const [subject, setSubject] = useState(originalEmail ? `回复: ${originalEmail.subject}` : '');
  const [drafts, setDrafts] = useState<EmailDraft>({ zh: '', en: '' });
  const [tone, setTone] = useState<ToneType>('professional');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isChinese, setIsChinese] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [needsApproval, setNeedsApproval] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState<ApprovalStatus>('none');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [checkResults, setCheckResults] = useState<{ greeting: boolean; attachment: boolean }>({ greeting: true, attachment: true });
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderTime, setReminderTime] = useState('');

  const content = isChinese ? drafts.zh : drafts.en;

  const setContent = (value: string) => {
    if (isChinese) {
      setDrafts(prev => ({ ...prev, zh: value }));
    } else {
      setDrafts(prev => ({ ...prev, en: value }));
    }
  };

  useEffect(() => {
    if (needsApproval && approvalStatus === 'none') {
      setApprovalStatus('pending');
    } else if (!needsApproval) {
      setApprovalStatus('none');
    }
  }, [needsApproval]);

  const generateChineseContent = (toneType: ToneType): string => {
    const intents: Record<string, string> = {
      '报价': '报价请求',
      '投诉': '投诉事项',
      '咨询': '咨询问题',
      '催办': '催促事项',
      '其他': '需求',
    };

    const intent = originalEmail?.intent || '其他';
    const customerName = originalEmail?.entities.customerName || '客户';
    const product = originalEmail?.entities.product || '产品';
    const amount = originalEmail?.entities.amount || 0;

    const templatesByTone: Record<ToneType, string> = {
      formal: `尊敬的${customerName}：

您好！

关于您邮件中提到的${product}，我们非常重视。

${intent === '报价' ? `根据您的需求，我们为您提供以下报价：
- 产品：${product}
- 数量：${amount}件
- 总价：${amount * 50}元

请确认是否接受此报价。` : ''}

${intent === '投诉' ? `非常抱歉给您带来不便。我们已收到您的反馈，正在紧急处理中。
我们会在24小时内给出解决方案，请您耐心等待。` : ''}

${intent === '咨询' ? `关于您的咨询，我们已准备好相关资料。
附件中包含详细的技术文档，请查收。` : ''}

${intent === '催办' ? `已收到您的催促，我们正在加急处理合同审批。
预计明天中午前完成，请您放心。` : ''}

如有任何疑问，请随时联系我。

此致
张三`,
      friendly: `Hi ${customerName}！

收到您的邮件啦~

${intent === '报价' ? `关于${product}的价格，我们给您申请了优惠价哦！
${amount}件的话每件只要50元，总共${amount * 50}元，划算吧！😉` : ''}

${intent === '投诉' ? `哎呀，非常抱歉给您添麻烦了！我们已经在处理啦，保证给您一个满意的答复！` : ''}

${intent === '咨询' ? `关于${product}的问题，我整理了详细文档发给您，有问题随时问我哈！` : ''}

${intent === '催办' ? `收到收到！合同审批我已经催法务部门了，应该明天就能搞定！` : ''}

等您回复哦~

张三`,
      urgent: `${customerName}：

紧急通知！

${intent === '报价' ? `关于${product}报价，由于库存紧张，请尽快确认！
报价有效期至本周五。` : ''}

${intent === '投诉' ? `关于您反馈的质量问题，我们已紧急处理！
解决方案将于今日18:00前发送，请密切关注邮件。` : ''}

${intent === '咨询' ? `关于您的技术咨询，时间紧迫，请尽快确认需求细节！` : ''}

${intent === '催办' ? `合同审批已加急处理中！
预计今日12:00前完成，请保持电话畅通。` : ''}

请尽快回复！

张三`,
      professional: `尊敬的${customerName}：

感谢您的来信。

针对您提出的${intents[intent]}，我们进行了认真研究。

${intent === '报价' ? `经核算，${product}的报价如下：
- 单价：50元/件
- 数量：${amount}件
- 合计：${amount * 50}元

付款方式：预付30%，发货前付清余款。` : ''}

${intent === '投诉' ? `经初步调查，问题原因已确认。我们将在3个工作日内提供完整解决方案，并安排专人跟进。` : ''}

${intent === '咨询' ? `附件为您所需的技术文档，包含详细说明及常见问题解答。` : ''}

${intent === '催办' ? `合同审批流程已进入最后阶段，预计明日完成。审批完成后将立即通知您。` : ''}

如有任何疑问，请随时与我联系。

此致
敬礼
张三`,
    };

    return templatesByTone[toneType];
  };

  const generateEnglishContent = (toneType: ToneType): string => {
    const intents: Record<string, string> = {
      '报价': 'quotation request',
      '投诉': 'complaint',
      '咨询': 'inquiry',
      '催办': 'follow-up request',
      '其他': 'request',
    };

    const intent = originalEmail?.intent || '其他';
    const customerName = originalEmail?.entities.customerName || 'Customer';
    const product = originalEmail?.entities.product || 'product';
    const amount = originalEmail?.entities.amount || 0;

    const templatesByTone: Record<ToneType, string> = {
      formal: `Dear ${customerName},

I hope this email finds you well.

We are writing to acknowledge receipt of your inquiry regarding ${product}.

${intent === '报价' ? `Based on your requirements, we are pleased to offer the following quotation:
- Product: ${product}
- Quantity: ${amount} units
- Total Price: ${amount * 50} CNY

Please confirm if you accept this offer.` : ''}

${intent === '投诉' ? `We sincerely apologize for any inconvenience caused. We have received your feedback and are actively working on a resolution.
We will provide a solution within 24 hours.` : ''}

${intent === '咨询' ? `Regarding your inquiry, we have prepared the relevant materials.
Please find the detailed technical documentation attached.` : ''}

${intent === '催办' ? `We acknowledge your request for expedited processing.
The contract approval is being expedited and is expected to be completed by tomorrow noon.` : ''}

Please do not hesitate to contact me if you have any questions.

Best regards,
Zhang San`,
      friendly: `Hi ${customerName}!

Great to hear from you~

${intent === '报价' ? `Great news! We've got a special discount for you on ${product}!
${amount} units at just 50 CNY each - that's ${amount * 50} CNY total. Pretty good deal, right? 😉` : ''}

${intent === '投诉' ? `Oh no, we're so sorry for the trouble! We're on it right away and promise to give you a satisfactory solution!` : ''}

${intent === '咨询' ? `About the ${product}, I've prepared detailed documentation for you. Just let me know if you have any questions!` : ''}

${intent === '催办' ? `Got it, got it! I've already nudged the legal team about the contract approval. Should be done tomorrow!` : ''}

Looking forward to your reply~

Zhang San`,
      urgent: `Dear ${customerName},

URGENT NOTICE

${intent === '报价' ? `Regarding the ${product} quotation, please be advised that due to limited inventory, we kindly request your prompt confirmation!
This quotation is valid until this Friday.` : ''}

${intent === '投诉' ? `Regarding your complaint, we have escalated this matter for immediate attention.
A resolution will be sent to you by 6:00 PM today. Please stay tuned.` : ''}

${intent === '咨询' ? `Regarding your technical inquiry, time is of the essence. Please confirm the requirements as soon as possible!` : ''}

${intent === '催办' ? `The contract approval has been expedited!
Expected completion by 12:00 PM today. Please ensure you are available by phone.` : ''}

Please respond at your earliest convenience.

Best regards,
Zhang San`,
      professional: `Dear ${customerName},

Thank you for your correspondence.

We have carefully reviewed your ${intents[intent]} regarding ${product}.

${intent === '报价' ? `After careful evaluation, we are pleased to provide the following quotation:
- Unit Price: 50 CNY
- Quantity: ${amount} units
- Total: ${amount * 50} CNY

Payment Terms: 30% deposit, balance before shipment.` : ''}

${intent === '投诉' ? `Following our initial investigation, the root cause has been identified. We will provide a comprehensive solution within 3 business days and assign a dedicated representative to follow up.` : ''}

${intent === '咨询' ? `Please find attached the technical documentation you requested, including specifications, integration examples, and FAQ.` : ''}

${intent === '催办' ? `The contract approval process has reached its final stage and is expected to be completed tomorrow. You will be notified immediately upon approval.` : ''}

Should you have any questions, please do not hesitate to contact me.

Sincerely,
Zhang San`,
    };

    return templatesByTone[toneType];
  };

  const generateReply = async () => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const zhContent = generateChineseContent(tone);
    const enContent = generateEnglishContent(tone);
    
    setDrafts({ zh: zhContent, en: enContent });
    setIsGenerating(false);
  };

  const translateContent = async () => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (isChinese) {
      const enContent = generateEnglishContent(tone);
      setDrafts(prev => ({ ...prev, en: enContent }));
      setIsChinese(false);
    } else {
      const zhContent = generateChineseContent(tone);
      setDrafts(prev => ({ ...prev, zh: zhContent }));
      setIsChinese(true);
    }
    setIsGenerating(false);
  };

  const checkContent = () => {
    const textToCheck = content.toLowerCase();
    const hasGreeting = textToCheck.includes('dear') || 
                        textToCheck.includes('hi') || 
                        textToCheck.includes('您好') || 
                        textToCheck.includes('尊敬') ||
                        textToCheck.includes('hello');
    setCheckResults({
      greeting: hasGreeting,
      attachment: attachments.length > 0,
    });
  };

  const handleSend = () => {
    if (needsApproval) {
      setShowReminderModal(true);
    } else {
      completeSend();
    }
  };

  const completeSend = () => {
    if (originalEmail) {
      updateEmailStatus(originalEmail.id, 'replied');
    }
    alert('邮件已发送！');
    navigate('/');
  };

  const handleApprovalSubmit = () => {
    setShowReminderModal(true);
  };

  const handleApprovalConfirm = () => {
    setShowReminderModal(false);
    if (approvalStatus === 'pending') {
      setApprovalStatus('approved');
    }
  };

  const handleFinalSend = () => {
    completeSend();
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

  const getApprovalStatusText = () => {
    switch (approvalStatus) {
      case 'pending': return '审批中';
      case 'approved': return '已通过';
      case 'rejected': return '已驳回';
      default: return '';
    }
  };

  const getApprovalStatusColor = () => {
    switch (approvalStatus) {
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'approved': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return '';
    }
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
                  onClick={translateContent}
                  disabled={!drafts.zh || isGenerating}
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
                    onClick={() => {
                      setDrafts({ zh: template.content, en: '' });
                      setIsChinese(true);
                    }}
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
                <div className="flex items-center gap-4">
                  {approvalStatus !== 'none' && (
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getApprovalStatusColor()}`}>
                      {getApprovalStatusText()}
                    </span>
                  )}
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
              ) : content ? (
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
                  {needsApproval && approvalStatus === 'pending' && (
                    <button
                      onClick={() => setApprovalStatus('rejected')}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      模拟驳回
                    </button>
                  )}
                  {needsApproval && approvalStatus === 'rejected' && (
                    <button
                      onClick={handleApprovalConfirm}
                      className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                    >
                      重新提交审批
                    </button>
                  )}
                  {needsApproval && approvalStatus === 'approved' && (
                    <button
                      onClick={handleFinalSend}
                      disabled={!to || !subject || !content}
                      className="btn-primary flex items-center gap-2 disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      确认发送
                    </button>
                  )}
                  {!needsApproval || approvalStatus !== 'approved' ? (
                    <button
                      onClick={needsApproval && approvalStatus === 'none' ? handleApprovalSubmit : handleSend}
                      disabled={!to || !subject || !content || (needsApproval && approvalStatus === 'pending')}
                      className="btn-primary flex items-center gap-2 disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      {needsApproval && approvalStatus === 'none' ? '提交审批' : '发送'}
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showReminderModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">设置跟进提醒</h3>
                <p className="text-sm text-gray-500">邮件发送后自动创建跟进任务</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">下次跟进时间</label>
                <input
                  type="datetime-local"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="input-field"
                  min={new Date().toISOString().slice(0, 16)}
                />
                <p className="text-xs text-gray-500 mt-1">建议：{isChinese ? '3天后' : '3 days later'}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowReminderModal(false)}
                className="flex-1 btn-secondary"
              >
                取消
              </button>
              <button
                onClick={() => {
                  if (originalEmail) {
                    const reminderDate = reminderTime || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
                    addTask({
                      userId: originalEmail.userId,
                      emailId: originalEmail.id,
                      title: `跟进: ${originalEmail.subject}`,
                      description: `来自联系人: ${to}`,
                      status: 'pending',
                      deadline: reminderDate,
                      reminderAt: reminderDate,
                      createdAt: new Date().toISOString(),
                    });
                  }
                  setShowReminderModal(false);
                  if (approvalStatus === 'pending') {
                    setApprovalStatus('approved');
                  } else {
                    completeSend();
                  }
                }}
                className="flex-1 btn-primary"
              >
                确认
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
