import { useState, useEffect, useCallback } from "react";
import "@/App.css";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { 
  Sparkles, FileText, Share2, ShoppingBag, Mail, Megaphone, Layout, Zap, Copy, History,
  CreditCard, User, LogOut, CheckCircle, Loader2, ArrowRight, Star, Palette, Layers,
  Eye, Code, Image, RefreshCw, Globe, Users, Download, Key, Briefcase, Home, 
  ShoppingCart, Laptop, Dumbbell, Gift, Plus, Trash2, Languages, Lock, X, ArrowLeft,
  MessageCircle, Send
} from "lucide-react";
import { Sandpack } from "@codesandbox/sandpack-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const iconMap = {
  FileText, Share2, ShoppingBag, Mail, Megaphone, Layout, Palette, Layers, Image, RefreshCw,
  Home, Dumbbell, Laptop, ShoppingCart, Briefcase
};

const toneOptions = [
  { value: "professional", label: "Professional" },
  { value: "casual", label: "Casual & Friendly" },
  { value: "persuasive", label: "Persuasive" },
  { value: "informative", label: "Informative" },
  { value: "humorous", label: "Humorous" },
  { value: "formal", label: "Formal" }
];

// Landing Page Component
const LandingPage = ({ onGetStarted, referralCode }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-16">
        <nav className="flex justify-between items-center mb-16">
          <div className="flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-purple-400" />
            <span className="text-2xl font-bold text-white">Champion AI Studio</span>
          </div>
          <Button onClick={onGetStarted} variant="outline" className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white" data-testid="nav-get-started-btn">
            Get Started
          </Button>
        </nav>

        <div className="text-center max-w-4xl mx-auto">
          <Badge className="mb-6 bg-purple-500/20 text-purple-300 border-purple-500/30">
            <Zap className="h-3 w-3 mr-1" /> AI-Powered Design & Development
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Design Websites & Apps
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400"> with AI</span>
          </h1>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Generate complete React code, UI components, landing pages, and full app designs in seconds. 
            Plus content creation, AI images, and 20+ languages.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={onGetStarted} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-lg px-8 py-6" data-testid="hero-get-started-btn">
              Start Building Free <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
          <p className="text-gray-400 mt-4">
            {referralCode ? "🎁 You've been referred! Get 5 bonus credits!" : "3 free credits to start • No credit card required"}
          </p>
        </div>

        {/* Hero Features - Design & Code First */}
        <div className="grid md:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-purple-600/30 to-pink-600/30 border border-purple-500/50 rounded-2xl p-8 text-center">
            <Palette className="h-14 w-14 text-purple-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Web Design</h3>
            <p className="text-gray-300">Generate complete landing pages, dashboards, and UI components with React + Tailwind</p>
            <Badge className="mt-4 bg-purple-500">Live Preview</Badge>
          </div>
          <div className="bg-gradient-to-br from-blue-600/30 to-purple-600/30 border border-blue-500/50 rounded-2xl p-8 text-center">
            <Layers className="h-14 w-14 text-blue-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">App Design</h3>
            <p className="text-gray-300">Full multi-page applications with routing, state management, and reusable components</p>
            <Badge className="mt-4 bg-blue-500">Production Ready</Badge>
          </div>
          <div className="bg-gradient-to-br from-green-600/30 to-blue-600/30 border border-green-500/50 rounded-2xl p-8 text-center">
            <Code className="h-14 w-14 text-green-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Code Generation</h3>
            <p className="text-gray-300">Copy-paste ready React code with Tailwind CSS styling and modern best practices</p>
            <Badge className="mt-4 bg-green-500">Copy & Use</Badge>
          </div>
        </div>

        {/* More Features Grid */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-white text-center mb-8">Plus Everything Else You Need</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { icon: Image, title: "AI Images", desc: "Custom graphics & visuals", highlight: true },
              { icon: RefreshCw, title: "Repurpose", desc: "1 piece → 10+ formats", highlight: true },
              { icon: Globe, title: "20+ Languages", desc: "Global content creation", highlight: true },
              { icon: FileText, title: "Blog Posts", desc: "SEO-optimized articles" },
              { icon: Share2, title: "Social Media", desc: "Viral-worthy posts" },
              { icon: Mail, title: "Email Copy", desc: "Emails that convert" },
              { icon: Megaphone, title: "Ad Copy", desc: "High-converting ads" },
              { icon: Layout, title: "Landing Pages", desc: "Conversion-focused copy" }
            ].map((feature, i) => (
              <Card key={i} className={`${feature.highlight ? 'bg-purple-500/10 border-purple-500/30' : 'bg-white/5 border-white/10'} hover:bg-white/10 transition-all`}>
                <CardHeader className="p-4">
                  <feature.icon className={`h-8 w-8 ${feature.highlight ? 'text-purple-300' : 'text-purple-400'} mb-2`} />
                  <CardTitle className="text-white text-base">{feature.title}</CardTitle>
                  <CardDescription className="text-gray-400 text-sm">{feature.desc}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {/* New Features Section */}
        <div className="mt-24 text-center">
          <h2 className="text-3xl font-bold text-white mb-12">Powerful Features</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="p-6 bg-white/5 rounded-xl border border-white/10">
              <Users className="h-12 w-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Brand Voices</h3>
              <p className="text-gray-400">Save your brand's tone and style for consistent content</p>
            </div>
            <div className="p-6 bg-white/5 rounded-xl border border-white/10">
              <Briefcase className="h-12 w-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Templates</h3>
              <p className="text-gray-400">Industry-specific templates for faster creation</p>
            </div>
            <div className="p-6 bg-white/5 rounded-xl border border-white/10">
              <Key className="h-12 w-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">API Access</h3>
              <p className="text-gray-400">Integrate our AI into your own applications</p>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="mt-32">
          <h2 className="text-4xl font-bold text-white text-center mb-4">Simple Pricing</h2>
          <p className="text-gray-400 text-center mb-12">Choose the plan that works for you</p>
          
          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { name: "Free", price: "$0", credits: "3", features: ["All content types", "20+ languages", "Basic support"] },
              { name: "Starter", price: "$9", credits: "50", features: ["Everything in Free", "Brand voices", "Templates"] },
              { name: "Pro", price: "$29", credits: "200", features: ["Everything in Starter", "Bulk generation", "API access"], popular: true },
              { name: "Unlimited", price: "$49/mo", credits: "∞", features: ["Everything in Pro", "Priority support", "Custom templates"] }
            ].map((plan, i) => (
              <Card key={i} className={`relative ${plan.popular ? 'border-purple-500 bg-purple-500/10' : 'bg-white/5 border-white/10'}`}>
                {plan.popular && <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-500"><Star className="h-3 w-3 mr-1" /> Popular</Badge>}
                <CardHeader className="text-center">
                  <CardTitle className="text-white">{plan.name}</CardTitle>
                  <div className="text-4xl font-bold text-white mt-2">{plan.price}</div>
                  <CardDescription className="text-purple-400">{plan.credits} credits</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-center text-gray-300 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-400 mr-2 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className={`w-full ${plan.popular ? 'bg-purple-500 hover:bg-purple-600' : ''}`} variant={plan.popular ? 'default' : 'outline'} onClick={onGetStarted}>
                    Get Started
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-32 border-t border-white/10 pt-12 pb-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
              <div className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-purple-400" />
                <span className="text-xl font-bold text-white">Champion AI Studio</span>
              </div>
              <div className="flex gap-6 text-gray-400">
                <a href="https://championaistudio.com" className="hover:text-purple-400">Home</a>
                <a href="mailto:support@championaistudio.com" className="hover:text-purple-400">Support</a>
              </div>
            </div>
            <div className="text-center text-gray-500 text-sm">
              <p>© 2025 Champion AI Studio. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

// Dashboard Component
const Dashboard = ({ user, setUser, onLogout }) => {
  const [contentTypes, setContentTypes] = useState({});
  const [languages, setLanguages] = useState({});
  const [templates, setTemplates] = useState({});
  const [selectedType, setSelectedType] = useState("blog_post");
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("professional");
  const [language, setLanguage] = useState("en");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [generatedImage, setGeneratedImage] = useState("");
  const [history, setHistory] = useState([]);
  const [showPricing, setShowPricing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showReferral, setShowReferral] = useState(false);
  const [showBrandVoice, setShowBrandVoice] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [showRepurpose, setShowRepurpose] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [referralInfo, setReferralInfo] = useState(null);
  const [brandVoices, setBrandVoices] = useState([]);
  const [selectedBrandVoice, setSelectedBrandVoice] = useState("none");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [bulkTopics, setBulkTopics] = useState("");
  const [repurposeContent, setRepurposeContent] = useState("");
  const [repurposeFormats, setRepurposeFormats] = useState(["social_media", "email"]);
  const [apiKey, setApiKey] = useState("");
  const [imagePrompt, setImagePrompt] = useState("");
  const [imageStyle, setImageStyle] = useState("realistic");
  const [activeTab, setActiveTab] = useState("generate");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [profileTab, setProfileTab] = useState("info");
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [typesRes, langsRes, templatesRes, historyRes, voicesRes, referralRes] = await Promise.all([
        axios.get(`${API}/content-types`),
        axios.get(`${API}/languages`),
        axios.get(`${API}/templates`),
        axios.get(`${API}/generations/${user.id}`),
        axios.get(`${API}/users/${user.id}/brand-voices`),
        axios.get(`${API}/referral/${user.id}`)
      ]);
      setContentTypes(typesRes.data);
      setLanguages(langsRes.data);
      setTemplates(templatesRes.data);
      setHistory(historyRes.data);
      setBrandVoices(voicesRes.data);
      setReferralInfo(referralRes.data);
    } catch (e) {
      console.error(e);
    }
  }, [user.id]);

  const refreshUser = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/users/${user.id}`);
      setUser(res.data);
      localStorage.setItem('champion_ai_user', JSON.stringify(res.data));
    } catch (e) {
      console.error(e);
    }
  }, [user.id, setUser]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic");
      return;
    }

    const creditsNeeded = contentTypes[selectedType]?.credits || 1;
    if (user.credits < creditsNeeded) {
      toast.error("Insufficient credits!");
      setShowPricing(true);
      return;
    }

    setGenerating(true);
    setGeneratedContent("");
    setGeneratedImage("");

    try {
      const res = await axios.post(`${API}/generate`, {
        user_id: user.id,
        content_type: selectedType,
        topic,
        tone,
        language,
        additional_info: additionalInfo,
        brand_voice_id: selectedBrandVoice !== "none" ? selectedBrandVoice : null,
        template_id: selectedTemplate || null
      });
      setGeneratedContent(res.data.generated_content);
      toast.success("Content generated!");
      refreshUser();
      fetchData();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) {
      toast.error("Please enter an image description");
      return;
    }

    if (user.credits < 2) {
      toast.error("Insufficient credits!");
      setShowPricing(true);
      return;
    }

    setGenerating(true);
    setGeneratedImage("");

    try {
      const res = await axios.post(`${API}/generate-image`, {
        user_id: user.id,
        prompt: imagePrompt,
        style: imageStyle
      });
      setGeneratedImage(res.data.image_url);
      toast.success("Image generated!");
      refreshUser();
      fetchData();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Image generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const handleBulkGenerate = async () => {
    const topics = bulkTopics.split("\n").filter(t => t.trim());
    if (topics.length === 0) {
      toast.error("Please enter at least one topic");
      return;
    }

    setGenerating(true);
    try {
      const res = await axios.post(`${API}/generate-bulk`, {
        user_id: user.id,
        content_type: selectedType,
        topics,
        tone,
        language
      });
      setGeneratedContent(res.data.content);
      toast.success(`Generated ${res.data.items_generated} items!`);
      setShowBulk(false);
      refreshUser();
      fetchData();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Bulk generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const handleRepurpose = async () => {
    if (!repurposeContent.trim()) {
      toast.error("Please enter content to repurpose");
      return;
    }

    setGenerating(true);
    try {
      const res = await axios.post(`${API}/repurpose`, {
        user_id: user.id,
        original_content: repurposeContent,
        output_formats: repurposeFormats,
        language
      });
      setGeneratedContent(res.data.content);
      toast.success("Content repurposed!");
      setShowRepurpose(false);
      refreshUser();
      fetchData();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Repurpose failed");
    } finally {
      setGenerating(false);
    }
  };

  const handlePurchase = async (plan) => {
    try {
      // Create PayPal payment order
      const res = await axios.post(`${API}/create-payment`, { user_id: user.id, plan });
      
      if (res.data.success && res.data.approval_url) {
        // Redirect to PayPal for payment
        toast.info("Redirecting to PayPal...");
        window.location.href = res.data.approval_url;
      } else {
        toast.error("Failed to initiate payment");
      }
    } catch (e) {
      toast.error("Payment failed - please try again");
    }
  };

  const handleExport = async (format) => {
    if (!history.length) return;
    const genId = history[0].id;
    window.open(`${API}/export/${genId}?format=${format}`, '_blank');
    toast.success(`Exporting as ${format.toUpperCase()}`);
  };

  const generateApiKey = async () => {
    try {
      const res = await axios.post(`${API}/users/${user.id}/api-key`);
      setApiKey(res.data.api_key);
      toast.success("API key generated!");
    } catch (e) {
      toast.error("Failed to generate API key");
    }
  };

  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    
    const userMessage = { role: "user", content: chatInput };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput("");
    setChatLoading(true);
    
    try {
      const res = await axios.post(`${API}/chat`, {
        user_id: user.id,
        message: chatInput,
        history: chatMessages.slice(-10) // Send last 10 messages for context
      });
      
      const aiMessage = { role: "assistant", content: res.data.response };
      setChatMessages(prev => [...prev, aiMessage]);
    } catch (e) {
      toast.error("Failed to get response");
      setChatMessages(prev => [...prev, { role: "assistant", content: "Sorry, I couldn't process your request. Please try again." }]);
    } finally {
      setChatLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied!");
  };

  const extractCode = (content) => {
    const codeBlockRegex = /```(?:jsx?|tsx?|react)?\s*([\s\S]*?)```/g;
    const matches = [...content.matchAll(codeBlockRegex)];
    if (matches.length > 0) return matches.map(m => m[1].trim()).join('\n\n');
    if (content.includes('import ') || content.includes('function ')) return content;
    return null;
  };

  const isCodeType = selectedType === "web_app_design" || selectedType === "wireframe";
  const IconComponent = iconMap[contentTypes[selectedType]?.icon] || FileText;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-x-hidden">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 md:py-4 flex justify-between items-center max-w-full overflow-hidden">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-purple-400" />
            <span className="text-lg md:text-xl font-bold text-white">Champion AI</span>
          </div>
          <div className="flex items-center gap-1 md:gap-3 flex-wrap justify-end">
            <Badge variant="outline" className="border-purple-400 text-purple-400 px-2 md:px-3 py-1 text-xs md:text-sm" data-testid="credits-badge">
              <Zap className="h-3 w-3 mr-1" /> {user.credits}
            </Badge>
            <Button variant="ghost" size="sm" onClick={() => setShowPricing(true)} className="text-gray-300 px-2" data-testid="buy-credits-btn">
              <CreditCard className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowReferral(true)} className="text-gray-300 px-2 hidden md:flex">
              <Gift className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowApiKey(true)} className="text-gray-300 px-2 hidden md:flex">
              <Key className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowProfile(true)} className="text-gray-300 px-2 flex items-center gap-1">
              <User className="h-4 w-4" />
              <span className="text-sm hidden md:inline">{user.name}</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={onLogout} className="text-gray-400">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white/5 border border-white/10 w-full grid grid-cols-5 h-auto">
            <TabsTrigger value="chat" className="data-[state=active]:bg-purple-500 text-xs sm:text-sm px-2 py-2">
              <MessageCircle className="h-4 w-4 sm:mr-2" /> <span className="hidden sm:inline">Ask AI</span>
            </TabsTrigger>
            <TabsTrigger value="generate" className="data-[state=active]:bg-purple-500 text-xs sm:text-sm px-2 py-2">
              <Sparkles className="h-4 w-4 sm:mr-2" /> <span className="hidden sm:inline">Generate</span>
            </TabsTrigger>
            <TabsTrigger value="image" className="data-[state=active]:bg-purple-500 text-xs sm:text-sm px-2 py-2">
              <Image className="h-4 w-4 sm:mr-2" /> <span className="hidden sm:inline">AI Image</span>
            </TabsTrigger>
            <TabsTrigger value="repurpose" className="data-[state=active]:bg-purple-500 text-xs sm:text-sm px-2 py-2">
              <RefreshCw className="h-4 w-4 sm:mr-2" /> <span className="hidden sm:inline">Repurpose</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-purple-500 text-xs sm:text-sm px-2 py-2">
              <History className="h-4 w-4 sm:mr-2" /> <span className="hidden sm:inline">History</span>
            </TabsTrigger>
          </TabsList>

          {/* Ask AI Chat Tab */}
          <TabsContent value="chat" className="space-y-6">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-purple-400" /> Ask AI Anything
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30 ml-2">FREE</Badge>
                </CardTitle>
                <CardDescription className="text-gray-400">Ask anything - science, math, coding, history, advice, and more!</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                  {chatMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                      <MessageCircle className="h-12 w-12 mb-4 opacity-50" />
                      <p className="text-center">Start a conversation!</p>
                      <p className="text-sm text-center mt-2 text-gray-600">Science, math, history, coding, recipes, advice - I know it all!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {chatMessages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] p-3 rounded-lg ${
                            msg.role === 'user' 
                              ? 'bg-purple-500 text-white' 
                              : 'bg-white/10 text-gray-200'
                          }`}>
                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          </div>
                        </div>
                      ))}
                      {chatLoading && (
                        <div className="flex justify-start">
                          <div className="bg-white/10 p-3 rounded-lg">
                            <Loader2 className="h-5 w-5 animate-spin text-purple-400" />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
              <CardFooter>
                <div className="flex gap-2 w-full">
                  <Input
                    placeholder="Ask me anything..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendChat()}
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 flex-1"
                    disabled={chatLoading}
                  />
                  <Button 
                    onClick={handleSendChat} 
                    disabled={chatLoading || !chatInput.trim()}
                    className="bg-purple-500 hover:bg-purple-600"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Generate Tab */}
          <TabsContent value="generate" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <IconComponent className="h-5 w-5 text-purple-400" /> Create Content
                    </span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setShowTemplates(true)} className="text-xs">
                        <Briefcase className="h-3 w-3 mr-1" /> Templates
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setShowBulk(true)} className="text-xs">
                        <Plus className="h-3 w-3 mr-1" /> Bulk
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-gray-300">Content Type</Label>
                      <Select value={selectedType} onValueChange={setSelectedType}>
                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(contentTypes).filter(([k]) => k !== 'image' && k !== 'repurpose').map(([key, value]) => (
                            <SelectItem key={key} value={key}>
                              {value.name} ({value.credits} cr)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-300">Language</Label>
                      <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                          <SelectValue placeholder="Select language">{languages[language] || "English"}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(languages).length > 0 ? (
                            Object.entries(languages).map(([code, name]) => (
                              <SelectItem key={code} value={code}>{name}</SelectItem>
                            ))
                          ) : (
                            <SelectItem value="en">English</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-gray-300">Tone</Label>
                      <Select value={tone} onValueChange={setTone}>
                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {toneOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-300">Brand Voice</Label>
                      <Select value={selectedBrandVoice} onValueChange={(val) => {
                        if (val === "add_new") {
                          setShowBrandVoice(true);
                        } else {
                          setSelectedBrandVoice(val);
                        }
                      }}>
                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                          <SelectValue placeholder="None" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {brandVoices.map((voice) => (
                            <SelectItem key={voice.id} value={voice.id}>{voice.name}</SelectItem>
                          ))}
                          <SelectItem value="add_new" className="text-purple-400">
                            <span className="flex items-center gap-1">
                              <Plus className="h-3 w-3" /> Add Brand Voice
                            </span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Topic / Subject</Label>
                    <Input
                      placeholder="e.g., Benefits of remote work for startups"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Additional Instructions</Label>
                    <Textarea
                      placeholder="Any specific requirements..."
                      value={additionalInfo}
                      onChange={(e) => setAdditionalInfo(e.target.value)}
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 min-h-[80px]"
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    onClick={handleGenerate}
                    disabled={generating}
                  >
                    {generating ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...</> : <><Sparkles className="h-4 w-4 mr-2" /> Generate</>}
                  </Button>
                  <Button variant="outline" onClick={() => setShowBrandVoice(true)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>

              {/* Output */}
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    <span>Output</span>
                    <div className="flex gap-2">
                      {generatedContent && (
                        <>
                          <Button variant="ghost" size="sm" onClick={() => handleExport('md')} className="text-gray-400">
                            <Download className="h-4 w-4 mr-1" /> Export
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => copyToClipboard(generatedContent)} className="text-purple-400">
                            <Copy className="h-4 w-4 mr-1" /> Copy
                          </Button>
                        </>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Show tabs for code types with preview */}
                  {generatedContent && isCodeType && extractCode(generatedContent) ? (
                    <div className="space-y-4">
                      <div className="flex gap-2 border-b border-white/10 pb-2">
                        <button
                          onClick={() => setShowPreview(false)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${!showPreview ? 'bg-purple-500 text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                          <Code className="h-4 w-4 inline mr-2" />Code
                        </button>
                        <button
                          onClick={() => setShowPreview(true)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${showPreview ? 'bg-purple-500 text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                          <Eye className="h-4 w-4 inline mr-2" />Live Preview
                        </button>
                      </div>
                      
                      {showPreview ? (
                        <div className="h-[350px] rounded-lg overflow-hidden border border-white/10">
                          <Sandpack
                            template="react"
                            theme="dark"
                            options={{ 
                              showNavigator: false, 
                              showTabs: false,
                              showLineNumbers: false,
                              showInlineErrors: true,
                              editorHeight: 0,
                              externalResources: ["https://cdn.tailwindcss.com"]
                            }}
                            files={{
                              "/App.js": {
                                code: extractCode(generatedContent),
                                active: true,
                                hidden: true
                              }
                            }}
                          />
                        </div>
                      ) : (
                        <ScrollArea className="h-[350px] rounded-lg">
                          <pre className="whitespace-pre-wrap text-gray-300 text-sm bg-black/30 p-4 rounded-lg">
                            {generatedContent}
                          </pre>
                        </ScrollArea>
                      )}
                    </div>
                  ) : (
                    <ScrollArea className="h-[400px] rounded-lg">
                      {generating ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                          <Loader2 className="h-8 w-8 animate-spin mb-4" />
                          <p>Creating content...</p>
                        </div>
                      ) : generatedContent ? (
                        <pre className="whitespace-pre-wrap text-gray-300 text-sm bg-black/30 p-4 rounded-lg">
                          {generatedContent}
                        </pre>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                          <Sparkles className="h-12 w-12 mb-4 opacity-50" />
                          <p>Generated content appears here</p>
                        </div>
                      )}
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* AI Image Tab */}
          <TabsContent value="image" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Image className="h-5 w-5 text-purple-400" /> AI Image Generator
                  </CardTitle>
                  <CardDescription className="text-gray-400">Generate custom images with AI (2 credits)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Describe your image</Label>
                    <Textarea
                      placeholder="A modern office space with natural lighting, minimalist design, plants..."
                      value={imagePrompt}
                      onChange={(e) => setImagePrompt(e.target.value)}
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 min-h-[120px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Style</Label>
                    <Select value={imageStyle} onValueChange={setImageStyle}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="realistic">Realistic / Photo</SelectItem>
                        <SelectItem value="illustration">Illustration</SelectItem>
                        <SelectItem value="3d">3D Render</SelectItem>
                        <SelectItem value="artistic">Artistic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
                    onClick={handleGenerateImage}
                    disabled={generating}
                  >
                    {generating ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...</> : <><Image className="h-4 w-4 mr-2" /> Generate Image</>}
                  </Button>
                </CardFooter>
              </Card>

              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Generated Image</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-square rounded-lg bg-black/30 flex items-center justify-center overflow-hidden">
                    {generating ? (
                      <Loader2 className="h-12 w-12 text-purple-400 animate-spin" />
                    ) : generatedImage ? (
                      <img src={generatedImage} alt="Generated" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center text-gray-500">
                        <Image className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Your image will appear here</p>
                      </div>
                    )}
                  </div>
                  {generatedImage && (
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" className="flex-1" onClick={() => window.open(generatedImage, '_blank')}>
                        <Download className="h-4 w-4 mr-2" /> Download
                      </Button>
                      <Button variant="outline" className="flex-1" onClick={() => copyToClipboard(generatedImage)}>
                        <Copy className="h-4 w-4 mr-2" /> Copy URL
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Repurpose Tab */}
          <TabsContent value="repurpose" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <RefreshCw className="h-5 w-5 text-purple-400" /> Content Repurposer
                  </CardTitle>
                  <CardDescription className="text-gray-400">Turn 1 piece of content into multiple formats (3 credits)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Paste your content</Label>
                    <Textarea
                      placeholder="Paste your blog post, article, or any content here..."
                      value={repurposeContent}
                      onChange={(e) => setRepurposeContent(e.target.value)}
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 min-h-[150px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Output Formats</Label>
                    <div className="flex flex-wrap gap-2">
                      {["social_media", "email", "ad_copy", "thread", "linkedin", "summary", "quotes"].map((format) => (
                        <Badge
                          key={format}
                          variant={repurposeFormats.includes(format) ? "default" : "outline"}
                          className={`cursor-pointer ${repurposeFormats.includes(format) ? 'bg-purple-500' : ''}`}
                          onClick={() => {
                            if (repurposeFormats.includes(format)) {
                              setRepurposeFormats(repurposeFormats.filter(f => f !== format));
                            } else {
                              setRepurposeFormats([...repurposeFormats, format]);
                            }
                          }}
                        >
                          {format.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Output Language</Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue placeholder="Select language">{languages[language] || "English"}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(languages).length > 0 ? (
                          Object.entries(languages).map(([code, name]) => (
                            <SelectItem key={code} value={code}>{name}</SelectItem>
                          ))
                        ) : (
                          <SelectItem value="en">English</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
                    onClick={handleRepurpose}
                    disabled={generating}
                  >
                    {generating ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Repurposing...</> : <><RefreshCw className="h-4 w-4 mr-2" /> Repurpose Content</>}
                  </Button>
                </CardFooter>
              </Card>

              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    Repurposed Content
                    {generatedContent && (
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(generatedContent)} className="text-purple-400">
                        <Copy className="h-4 w-4 mr-1" /> Copy All
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    {generating ? (
                      <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <Loader2 className="h-8 w-8 animate-spin mb-4" />
                        <p>Repurposing content...</p>
                      </div>
                    ) : generatedContent ? (
                      <pre className="whitespace-pre-wrap text-gray-300 text-sm bg-black/30 p-4 rounded-lg">
                        {generatedContent}
                      </pre>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <RefreshCw className="h-12 w-12 mb-4 opacity-50" />
                        <p>Repurposed content appears here</p>
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Generation History</CardTitle>
              </CardHeader>
              <CardContent>
                {history.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No generations yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {history.slice(0, 20).map((item) => (
                      <Card key={item.id} className="bg-white/5 border-white/10">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-white text-base">{item.topic.slice(0, 50)}...</CardTitle>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-gray-400">{contentTypes[item.content_type]?.name || item.content_type}</Badge>
                              {item.image_url && <Badge className="bg-purple-500">Image</Badge>}
                            </div>
                          </div>
                          <CardDescription className="text-gray-500 text-xs">
                            {new Date(item.created_at).toLocaleString()} • {item.credits_used} credits • {languages[item.language] || 'English'}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {item.image_url ? (
                            <img src={item.image_url} alt={item.topic} className="w-32 h-32 object-cover rounded" />
                          ) : (
                            <p className="text-gray-400 text-sm line-clamp-2">{item.generated_content}</p>
                          )}
                        </CardContent>
                        <CardFooter>
                          <Button variant="ghost" size="sm" onClick={() => copyToClipboard(item.image_url || item.generated_content)} className="text-purple-400">
                            <Copy className="h-4 w-4 mr-1" /> Copy
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Pricing Dialog */}
      <Dialog open={showPricing} onOpenChange={setShowPricing}>
        <DialogContent className="bg-slate-900 border-white/10 max-w-4xl">
          <button 
            onClick={() => setShowPricing(false)}
            className="absolute right-4 top-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          <DialogHeader>
            <DialogTitle className="text-white text-2xl">Purchase Credits</DialogTitle>
            <DialogDescription className="text-gray-400">Secure payment via PayPal</DialogDescription>
          </DialogHeader>
          <div className="grid md:grid-cols-3 gap-4 mt-4">
            {[
              { key: "starter", name: "Starter", price: "$9", credits: "50" },
              { key: "pro", name: "Pro", price: "$29", credits: "200", popular: true },
              { key: "unlimited", name: "Unlimited", price: "$49/mo", credits: "∞" }
            ].map((plan) => (
              <Card key={plan.key} className={`${plan.popular ? 'border-purple-500 bg-purple-500/10' : 'bg-white/5 border-white/10'}`}>
                <CardHeader className="text-center">
                  <CardTitle className="text-white">{plan.name}</CardTitle>
                  <div className="text-3xl font-bold text-white">{plan.price}</div>
                  <CardDescription className="text-purple-400">{plan.credits} credits</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button className={`w-full ${plan.popular ? 'bg-purple-500' : ''}`} variant={plan.popular ? 'default' : 'outline'} onClick={() => handlePurchase(plan.key)}>
                    Pay with PayPal
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Referral Dialog */}
      <Dialog open={showReferral} onOpenChange={setShowReferral}>
        <DialogContent className="bg-slate-900 border-white/10">
          <button 
            onClick={() => setShowReferral(false)}
            className="absolute right-4 top-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          <DialogHeader>
            <DialogTitle className="text-white text-2xl flex items-center gap-2">
              <Gift className="text-purple-400" /> Referral Program
            </DialogTitle>
            <DialogDescription className="text-gray-400">Earn 10 credits for each friend who signs up!</DialogDescription>
          </DialogHeader>
          {referralInfo && (
            <div className="space-y-4 mt-4">
              <div className="p-4 bg-white/5 rounded-lg">
                <Label className="text-gray-400 text-sm">Your Referral Link</Label>
                <div className="flex gap-2 mt-2">
                  <Input value={referralInfo.referral_link} readOnly className="bg-white/5 border-white/10 text-white" />
                  <Button onClick={() => copyToClipboard(referralInfo.referral_link)}><Copy className="h-4 w-4" /></Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-lg text-center">
                  <div className="text-3xl font-bold text-purple-400">{referralInfo.total_referrals}</div>
                  <div className="text-gray-400 text-sm">Friends Referred</div>
                </div>
                <div className="p-4 bg-white/5 rounded-lg text-center">
                  <div className="text-3xl font-bold text-green-400">{referralInfo.credits_earned}</div>
                  <div className="text-gray-400 text-sm">Credits Earned</div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* API Key Dialog */}
      <Dialog open={showApiKey} onOpenChange={setShowApiKey}>
        <DialogContent className="bg-slate-900 border-white/10">
          <button 
            onClick={() => setShowApiKey(false)}
            className="absolute right-4 top-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          <DialogHeader>
            <DialogTitle className="text-white text-2xl flex items-center gap-2">
              <Key className="text-purple-400" /> API Access
            </DialogTitle>
            <DialogDescription className="text-gray-400">Integrate Champion AI into your applications</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {apiKey || user.api_key ? (
              <div className="p-4 bg-white/5 rounded-lg">
                <Label className="text-gray-400 text-sm">Your API Key</Label>
                <div className="flex gap-2 mt-2">
                  <Input value={apiKey || user.api_key || ''} readOnly className="bg-white/5 border-white/10 text-white font-mono text-sm" />
                  <Button onClick={() => copyToClipboard(apiKey || user.api_key)}><Copy className="h-4 w-4" /></Button>
                </div>
              </div>
            ) : (
              <Button onClick={generateApiKey} className="w-full bg-purple-500">Generate API Key</Button>
            )}
            <div className="p-4 bg-white/5 rounded-lg">
              <Label className="text-gray-400 text-sm">Example Usage</Label>
              <pre className="text-xs text-gray-300 mt-2 overflow-x-auto">
{`curl -X POST "${API}/v1/generate" \\
  -H "Content-Type: application/json" \\
  -d '{"content_type":"blog_post","topic":"AI"}'&api_key=YOUR_KEY`}
              </pre>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Templates Dialog */}
      <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
        <DialogContent className="bg-slate-900 border-white/10 max-w-2xl">
          <button 
            onClick={() => setShowTemplates(false)}
            className="absolute right-4 top-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          <DialogHeader>
            <DialogTitle className="text-white text-2xl">Templates Library</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[400px] mt-4">
            <div className="space-y-4">
              {Object.entries(templates).map(([key, category]) => (
                <div key={key}>
                  <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                    {iconMap[category.icon] && (() => { const Icon = iconMap[category.icon]; return <Icon className="h-4 w-4 text-purple-400" />; })()}
                    {category.name}
                  </h3>
                  <div className="grid gap-2">
                    {category.templates.map((template) => (
                      <Button
                        key={template.id}
                        variant="outline"
                        className="justify-start text-left h-auto py-3"
                        onClick={() => {
                          setSelectedTemplate(template.id);
                          setShowTemplates(false);
                          toast.success(`Template "${template.name}" selected`);
                        }}
                      >
                        <div>
                          <div className="font-medium">{template.name}</div>
                          <div className="text-xs text-gray-400">{template.prompt.slice(0, 60)}...</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Bulk Generation Dialog */}
      <Dialog open={showBulk} onOpenChange={setShowBulk}>
        <DialogContent className="bg-slate-900 border-white/10">
          <button 
            onClick={() => setShowBulk(false)}
            className="absolute right-4 top-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          <DialogHeader>
            <DialogTitle className="text-white text-2xl">Bulk Generation</DialogTitle>
            <DialogDescription className="text-gray-400">Generate content for multiple topics at once (max 20)</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Topics (one per line)</Label>
              <Textarea
                placeholder="Topic 1&#10;Topic 2&#10;Topic 3"
                value={bulkTopics}
                onChange={(e) => setBulkTopics(e.target.value)}
                className="bg-white/5 border-white/10 text-white min-h-[150px]"
              />
            </div>
            <p className="text-sm text-gray-400">
              {bulkTopics.split("\n").filter(t => t.trim()).length} topics × {contentTypes[selectedType]?.credits || 1} credits = 
              <span className="text-purple-400 ml-1">
                {bulkTopics.split("\n").filter(t => t.trim()).length * (contentTypes[selectedType]?.credits || 1)} credits total
              </span>
            </p>
            <Button className="w-full bg-purple-500" onClick={handleBulkGenerate} disabled={generating}>
              {generating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
              Generate All
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Brand Voice Dialog */}
      <Dialog open={showBrandVoice} onOpenChange={setShowBrandVoice}>
        <DialogContent className="bg-slate-900 border-white/10">
          <button 
            onClick={() => setShowBrandVoice(false)}
            className="absolute right-4 top-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          <DialogHeader>
            <DialogTitle className="text-white text-2xl">Brand Voices</DialogTitle>
            <DialogDescription className="text-gray-400">Save your brand's tone for consistent content</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {brandVoices.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-gray-500 mb-4" />
                <p className="text-gray-400 mb-2">No brand voices yet</p>
                <p className="text-gray-500 text-sm">Create a brand voice to maintain consistent tone across all your content</p>
              </div>
            ) : (
              brandVoices.map((voice) => (
                <div key={voice.id} className="p-3 bg-white/5 rounded-lg flex justify-between items-center">
                  <div>
                    <div className="text-white font-medium">{voice.name}</div>
                    <div className="text-gray-400 text-sm">{voice.tone} • {voice.style}</div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={async () => {
                    await axios.delete(`${API}/users/${user.id}/brand-voice/${voice.id}`);
                    fetchData();
                    toast.success("Deleted");
                  }}>
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </Button>
                </div>
              ))
            )}
            <Button variant="outline" className="w-full" onClick={() => {
              const name = prompt("Brand voice name:");
              const tone = prompt("Tone (e.g., friendly, professional):");
              const style = prompt("Style (e.g., concise, detailed):");
              if (name && tone && style) {
                axios.post(`${API}/users/${user.id}/brand-voice`, { name, tone, style, keywords: [], avoid_words: [] })
                  .then(() => { fetchData(); toast.success("Created!"); });
              }
            }}>
              <Plus className="h-4 w-4 mr-2" /> Add Brand Voice
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Profile Dialog */}
      <Dialog open={showProfile} onOpenChange={setShowProfile}>
        <DialogContent className="bg-slate-900 border-white/10 max-w-2xl max-h-[80vh] overflow-hidden">
          <button 
            onClick={() => setShowProfile(false)}
            className="absolute right-4 top-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          <DialogHeader>
            <DialogTitle className="text-white text-2xl flex items-center gap-2">
              <User className="text-purple-400" /> My Profile
            </DialogTitle>
          </DialogHeader>
          
          {/* Profile Tabs */}
          <div className="flex gap-2 mt-4 border-b border-white/10 pb-2">
            {["info", "history", "security"].map((tab) => (
              <button
                key={tab}
                onClick={() => setProfileTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  profileTab === tab 
                    ? 'bg-purple-500 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab === "info" ? "Account Info" : tab === "history" ? "My Generations" : "Security"}
              </button>
            ))}
          </div>

          <ScrollArea className="h-[400px] mt-4">
            {/* Account Info Tab */}
            {profileTab === "info" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 rounded-lg">
                    <Label className="text-gray-400 text-sm">Name</Label>
                    <p className="text-white text-lg font-medium mt-1">{user.name}</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-lg">
                    <Label className="text-gray-400 text-sm">Email</Label>
                    <p className="text-white text-lg font-medium mt-1">{user.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-white/5 rounded-lg text-center">
                    <div className="text-3xl font-bold text-purple-400">{user.credits}</div>
                    <div className="text-gray-400 text-sm">Credits</div>
                  </div>
                  <div className="p-4 bg-white/5 rounded-lg text-center">
                    <div className="text-3xl font-bold text-blue-400">{history.length}</div>
                    <div className="text-gray-400 text-sm">Generations</div>
                  </div>
                  <div className="p-4 bg-white/5 rounded-lg text-center">
                    <div className="text-3xl font-bold text-green-400 capitalize">{user.plan}</div>
                    <div className="text-gray-400 text-sm">Plan</div>
                  </div>
                </div>
                <div className="p-4 bg-white/5 rounded-lg">
                  <Label className="text-gray-400 text-sm">Member Since</Label>
                  <p className="text-white mt-1">{new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                {user.referral_code && (
                  <div className="p-4 bg-white/5 rounded-lg">
                    <Label className="text-gray-400 text-sm">Your Referral Code</Label>
                    <div className="flex gap-2 mt-2">
                      <Input value={user.referral_code} readOnly className="bg-white/5 border-white/10 text-white" />
                      <Button onClick={() => copyToClipboard(user.referral_code)} size="sm"><Copy className="h-4 w-4" /></Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Generation History Tab */}
            {profileTab === "history" && (
              <div className="space-y-3">
                {history.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No generations yet</p>
                    <p className="text-sm mt-2">Start creating content to see your history here</p>
                  </div>
                ) : (
                  history.map((item) => (
                    <div key={item.id} className="p-4 bg-white/5 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">{contentTypes[item.content_type]?.name || item.content_type}</Badge>
                            {item.image_url && <Badge className="bg-purple-500 text-xs">Image</Badge>}
                            <span className="text-gray-500 text-xs">{item.credits_used} credits</span>
                          </div>
                          <h4 className="text-white font-medium">{item.topic}</h4>
                          <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                            {item.image_url ? "AI Generated Image" : item.generated_content?.slice(0, 150)}...
                          </p>
                          <p className="text-gray-500 text-xs mt-2">
                            {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        {item.image_url && (
                          <img src={item.image_url} alt={item.topic} className="w-16 h-16 rounded-lg object-cover ml-4" />
                        )}
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => {
                            copyToClipboard(item.image_url || item.generated_content);
                          }}
                          className="text-xs"
                        >
                          <Copy className="h-3 w-3 mr-1" /> Copy
                        </Button>
                        {item.image_url && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => window.open(item.image_url, '_blank')}
                            className="text-xs"
                          >
                            <Download className="h-3 w-3 mr-1" /> Download
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Security Tab */}
            {profileTab === "security" && (
              <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-lg">
                  <h3 className="text-white font-medium mb-4">Change Password</h3>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label className="text-gray-300">Current Password</Label>
                      <Input 
                        type="password" 
                        placeholder="Enter current password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="bg-white/5 border-white/10 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-300">New Password</Label>
                      <Input 
                        type="password" 
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="bg-white/5 border-white/10 text-white"
                      />
                    </div>
                    <Button 
                      className="w-full bg-purple-500 hover:bg-purple-600"
                      onClick={async () => {
                        if (!currentPassword || !newPassword) {
                          toast.error("Please fill in both fields");
                          return;
                        }
                        if (newPassword.length < 6) {
                          toast.error("New password must be at least 6 characters");
                          return;
                        }
                        try {
                          // First verify current password by logging in
                          await axios.post(`${API}/login`, { email: user.email, password: currentPassword });
                          // Then request password reset
                          const resetRes = await axios.post(`${API}/forgot-password`, { email: user.email });
                          // Use the code to reset
                          await axios.post(`${API}/reset-password`, { 
                            email: user.email, 
                            token: resetRes.data.code, 
                            new_password: newPassword 
                          });
                          toast.success("Password changed successfully!");
                          setCurrentPassword("");
                          setNewPassword("");
                        } catch (e) {
                          toast.error(e.response?.data?.detail || "Failed to change password. Check your current password.");
                        }
                      }}
                    >
                      Update Password
                    </Button>
                  </div>
                </div>
                
                <div className="p-4 bg-white/5 rounded-lg">
                  <h3 className="text-white font-medium mb-2">Account Actions</h3>
                  <p className="text-gray-400 text-sm mb-4">Manage your account settings</p>
                  <Button 
                    variant="outline" 
                    className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10"
                    onClick={() => {
                      if (window.confirm("Are you sure you want to logout?")) {
                        onLogout();
                        setShowProfile(false);
                      }
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" /> Logout
                  </Button>
                </div>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Auth Screen with Login/Signup/Forgot Password
const AuthScreen = ({ onAuth, referralCode: initialReferralCode }) => {
  const [mode, setMode] = useState("signup"); // "signup", "login", "forgot", "reset"
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [referralCodeInput, setReferralCodeInput] = useState(initialReferralCode || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!email.trim() || !name.trim() || !password.trim()) {
      setError("Please fill in all fields");
      return;
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API}/users`, { 
        email, 
        name, 
        password,
        referral_code: referralCodeInput.trim() || null 
      });
      localStorage.setItem('champion_ai_user', JSON.stringify(res.data));
      onAuth(res.data);
      toast.success(referralCodeInput ? "Welcome! You got 2 bonus credits!" : "Welcome to Champion AI Studio!");
    } catch (e) {
      setError(e.response?.data?.detail || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!email.trim() || !password.trim()) {
      setError("Please enter email and password");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API}/login`, { email, password });
      localStorage.setItem('champion_ai_user', JSON.stringify(res.data));
      onAuth(res.data);
      toast.success("Welcome back!");
    } catch (e) {
      setError(e.response?.data?.detail || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    
    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API}/forgot-password`, { email });
      setSuccessMsg("Reset code sent! Check below (in production this would be emailed)");
      // For demo purposes, show the code - remove in production
      if (res.data.code) {
        setResetCode(res.data.code);
      }
      setMode("reset");
      toast.success("Reset code generated!");
    } catch (e) {
      setError(e.response?.data?.detail || "Failed to send reset code");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!resetCode.trim() || !newPassword.trim()) {
      setError("Please enter the reset code and new password");
      return;
    }
    
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API}/reset-password`, { 
        email, 
        token: resetCode, 
        new_password: newPassword 
      });
      toast.success("Password reset successfully! Please login.");
      setMode("login");
      setPassword("");
      setResetCode("");
      setNewPassword("");
    } catch (e) {
      setError(e.response?.data?.detail || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case "login": return "Welcome Back";
      case "forgot": return "Forgot Password";
      case "reset": return "Reset Password";
      default: return "Create Account";
    }
  };

  const getDescription = () => {
    switch (mode) {
      case "login": return "Login to access your dashboard";
      case "forgot": return "Enter your email to receive a reset code";
      case "reset": return "Enter the code and your new password";
      default: return referralCode ? "🎁 You've been referred! Get 5 bonus credits!" : "Sign up and get 3 free credits";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/5 border-white/10">
        <CardHeader className="text-center">
          <Sparkles className="h-12 w-12 text-purple-400 mx-auto mb-4" />
          <CardTitle className="text-2xl text-white">{getTitle()}</CardTitle>
          <CardDescription className="text-gray-400">{getDescription()}</CardDescription>
        </CardHeader>
        
        {/* Signup Form */}
        {mode === "signup" && (
          <form onSubmit={handleSignup}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input 
                    placeholder="John Doe" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    className="bg-white/5 border-white/10 text-white pl-10" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input 
                    type="email" 
                    placeholder="john@example.com" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    className="bg-white/5 border-white/10 text-white pl-10" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    className="bg-white/5 border-white/10 text-white pl-10" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    className="bg-white/5 border-white/10 text-white pl-10" 
                  />
                </div>
              </div>
              {error && <p className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg">{error}</p>}
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full bg-gradient-to-r from-purple-500 to-pink-500" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Create Account
              </Button>
              <p className="text-gray-400 text-sm text-center">
                Already have an account?{" "}
                <button type="button" onClick={() => { setMode("login"); setError(""); }} className="text-purple-400 hover:text-purple-300 font-medium">
                  Login
                </button>
              </p>
            </CardFooter>
          </form>
        )}

        {/* Login Form */}
        {mode === "login" && (
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input 
                    type="email" 
                    placeholder="john@example.com" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    className="bg-white/5 border-white/10 text-white pl-10" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    className="bg-white/5 border-white/10 text-white pl-10" 
                  />
                </div>
              </div>
              {error && <p className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg">{error}</p>}
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full bg-gradient-to-r from-purple-500 to-pink-500" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Login
              </Button>
              <div className="flex flex-col gap-2 text-center">
                <button type="button" onClick={() => { setMode("forgot"); setError(""); }} className="text-purple-400 hover:text-purple-300 text-sm">
                  Forgot password?
                </button>
                <p className="text-gray-400 text-sm">
                  Don't have an account?{" "}
                  <button type="button" onClick={() => { setMode("signup"); setError(""); }} className="text-purple-400 hover:text-purple-300 font-medium">
                    Sign up
                  </button>
                </p>
              </div>
            </CardFooter>
          </form>
        )}

        {/* Forgot Password Form */}
        {mode === "forgot" && (
          <form onSubmit={handleForgotPassword}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input 
                    type="email" 
                    placeholder="john@example.com" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    className="bg-white/5 border-white/10 text-white pl-10" 
                  />
                </div>
              </div>
              {error && <p className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg">{error}</p>}
              {successMsg && <p className="text-green-400 text-sm bg-green-500/10 p-3 rounded-lg">{successMsg}</p>}
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full bg-gradient-to-r from-purple-500 to-pink-500" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Send Reset Code
              </Button>
              <button type="button" onClick={() => { setMode("login"); setError(""); setSuccessMsg(""); }} className="text-purple-400 hover:text-purple-300 text-sm">
                Back to Login
              </button>
            </CardFooter>
          </form>
        )}

        {/* Reset Password Form */}
        {mode === "reset" && (
          <form onSubmit={handleResetPassword}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Reset Code</Label>
                <Input 
                  placeholder="Enter 6-digit code" 
                  value={resetCode} 
                  onChange={(e) => setResetCode(e.target.value)} 
                  className="bg-white/5 border-white/10 text-white text-center text-lg tracking-widest" 
                  maxLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)} 
                    className="bg-white/5 border-white/10 text-white pl-10" 
                  />
                </div>
              </div>
              {error && <p className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg">{error}</p>}
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full bg-gradient-to-r from-purple-500 to-pink-500" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Reset Password
              </Button>
              <button type="button" onClick={() => { setMode("forgot"); setError(""); }} className="text-purple-400 hover:text-purple-300 text-sm">
                Resend Code
              </button>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
};

// Main App
function App() {
  const getInitialState = () => {
    const saved = localStorage.getItem('champion_ai_user');
    if (saved) {
      try { return JSON.parse(saved); } catch { localStorage.removeItem('champion_ai_user'); }
    }
    return null;
  };

  const [user, setUser] = useState(getInitialState);
  const [showLanding, setShowLanding] = useState(() => !getInitialState());
  
  // Get referral code, payment status, and admin route from URL
  const urlParams = new URLSearchParams(window.location.search);
  const referralCode = urlParams.get('ref');
  const paymentStatus = urlParams.get('payment');
  const isAdminRoute = window.location.pathname === '/admin' || window.location.hash === '#admin';

  // Handle payment callbacks
  useEffect(() => {
    if (paymentStatus === 'success') {
      toast.success("🎉 Payment successful! Credits have been added to your account.");
      // Refresh user data to get updated credits
      if (user) {
        axios.get(`${API}/users/${user.id}`).then(res => {
          setUser(res.data);
          localStorage.setItem('champion_ai_user', JSON.stringify(res.data));
        });
      }
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (paymentStatus === 'cancelled') {
      toast.info("Payment was cancelled.");
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (paymentStatus === 'error') {
      toast.error("Payment failed. Please try again or contact support.");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [paymentStatus, user]);

  const handleLogout = () => {
    localStorage.removeItem('champion_ai_user');
    setUser(null);
    setShowLanding(true);
  };

  // Check for admin route
  if (isAdminRoute) {
    const AdminDashboard = require('./AdminDashboard').default;
    return <AdminDashboard />;
  }

  return (
    <div className="App">
      <Toaster position="top-right" richColors />
      {showLanding ? (
        <LandingPage onGetStarted={() => setShowLanding(false)} referralCode={referralCode} />
      ) : user ? (
        <Dashboard user={user} setUser={setUser} onLogout={handleLogout} />
      ) : (
        <AuthScreen onAuth={setUser} referralCode={referralCode} />
      )}
    </div>
  );
}

export default App;
