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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { 
  Sparkles, 
  FileText, 
  Share2, 
  ShoppingBag, 
  Mail, 
  Megaphone, 
  Layout,
  Zap,
  Copy,
  History,
  CreditCard,
  User,
  LogOut,
  CheckCircle,
  Loader2,
  ArrowRight,
  Star
} from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const iconMap = {
  FileText: FileText,
  Share2: Share2,
  ShoppingBag: ShoppingBag,
  Mail: Mail,
  Megaphone: Megaphone,
  Layout: Layout
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
const LandingPage = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <nav className="flex justify-between items-center mb-16">
          <div className="flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-purple-400" />
            <span className="text-2xl font-bold text-white">AI Content Studio</span>
          </div>
          <Button onClick={onGetStarted} variant="outline" className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white" data-testid="nav-get-started-btn">
            Get Started
          </Button>
        </nav>

        <div className="text-center max-w-4xl mx-auto">
          <Badge className="mb-6 bg-purple-500/20 text-purple-300 border-purple-500/30">
            <Zap className="h-3 w-3 mr-1" /> AI-Powered Content Generation
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Create Stunning Content
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400"> in Seconds</span>
          </h1>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Generate blog posts, social media content, emails, ad copy, and more with the power of AI. Save hours of writing time and boost your marketing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={onGetStarted} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-lg px-8 py-6" data-testid="hero-get-started-btn">
              Start Free <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800 text-lg px-8 py-6">
              See Examples
            </Button>
          </div>
          <p className="text-gray-400 mt-4">3 free credits to start • No credit card required</p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-24">
          {[
            { icon: FileText, title: "Blog Posts", desc: "SEO-optimized articles that rank" },
            { icon: Share2, title: "Social Media", desc: "Viral-worthy posts for any platform" },
            { icon: Mail, title: "Email Copy", desc: "Emails that get opened and clicked" },
            { icon: Megaphone, title: "Ad Copy", desc: "High-converting advertisements" },
            { icon: ShoppingBag, title: "Product Descriptions", desc: "Compelling copy that sells" },
            { icon: Layout, title: "Landing Pages", desc: "Conversion-focused web copy" }
          ].map((feature, i) => (
            <Card key={i} className="bg-white/5 border-white/10 hover:bg-white/10 transition-all">
              <CardHeader>
                <feature.icon className="h-10 w-10 text-purple-400 mb-2" />
                <CardTitle className="text-white">{feature.title}</CardTitle>
                <CardDescription className="text-gray-400">{feature.desc}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Pricing Section */}
        <div className="mt-32">
          <h2 className="text-4xl font-bold text-white text-center mb-4">Simple, Transparent Pricing</h2>
          <p className="text-gray-400 text-center mb-12">Choose the plan that works for you</p>
          
          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { name: "Free Trial", price: "$0", credits: "3", features: ["3 generations", "All content types", "Basic support"] },
              { name: "Starter", price: "$9", credits: "50", features: ["50 credits", "All content types", "Priority support"], popular: false },
              { name: "Pro", price: "$29", credits: "200", features: ["200 credits", "All content types", "Premium support", "History access"], popular: true },
              { name: "Unlimited", price: "$49/mo", credits: "∞", features: ["Unlimited generations", "All content types", "VIP support", "API access"] }
            ].map((plan, i) => (
              <Card key={i} className={`relative ${plan.popular ? 'border-purple-500 bg-purple-500/10' : 'bg-white/5 border-white/10'}`}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-500">
                    <Star className="h-3 w-3 mr-1" /> Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-white">{plan.name}</CardTitle>
                  <div className="text-4xl font-bold text-white mt-2">{plan.price}</div>
                  <CardDescription className="text-purple-400">{plan.credits} credits</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-center text-gray-300">
                        <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    className={`w-full ${plan.popular ? 'bg-purple-500 hover:bg-purple-600' : ''}`}
                    variant={plan.popular ? 'default' : 'outline'}
                    onClick={onGetStarted}
                    data-testid={`pricing-${plan.name.toLowerCase().replace(' ', '-')}-btn`}
                  >
                    Get Started
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-32 text-center text-gray-400 pb-8">
          <p>© 2025 AI Content Studio. Generate revenue with AI-powered content.</p>
        </footer>
      </div>
    </div>
  );
};

// Dashboard Component
const Dashboard = ({ user, setUser, onLogout }) => {
  const [contentTypes, setContentTypes] = useState({});
  const [selectedType, setSelectedType] = useState("");
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("professional");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [history, setHistory] = useState([]);
  const [showPricing, setShowPricing] = useState(false);

  const fetchContentTypes = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/content-types`);
      setContentTypes(res.data);
      setSelectedType(Object.keys(res.data)[0]);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/generations/${user.id}`);
      setHistory(res.data);
    } catch (e) {
      console.error(e);
    }
  }, [user.id]);

  const refreshUser = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/users/${user.id}`);
      setUser(res.data);
    } catch (e) {
      console.error(e);
    }
  }, [user.id, setUser]);

  useEffect(() => {
    fetchContentTypes();
    fetchHistory();
  }, [fetchContentTypes, fetchHistory]);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic");
      return;
    }

    const creditsNeeded = contentTypes[selectedType]?.credits || 1;
    if (user.credits < creditsNeeded) {
      toast.error("Insufficient credits! Please purchase more.");
      setShowPricing(true);
      return;
    }

    setGenerating(true);
    setGeneratedContent("");

    try {
      const res = await axios.post(`${API}/generate`, {
        user_id: user.id,
        content_type: selectedType,
        topic: topic,
        tone: tone,
        additional_info: additionalInfo
      });
      setGeneratedContent(res.data.generated_content);
      toast.success("Content generated successfully!");
      refreshUser();
      fetchHistory();
    } catch (e) {
      if (e.response?.status === 402) {
        toast.error("Insufficient credits! Please purchase more.");
        setShowPricing(true);
      } else {
        toast.error("Failed to generate content. Please try again.");
      }
    } finally {
      setGenerating(false);
    }
  };

  const handlePurchase = async (plan) => {
    try {
      const res = await axios.post(`${API}/purchase-credits`, {
        user_id: user.id,
        plan: plan
      });
      toast.success(res.data.message);
      refreshUser();
      setShowPricing(false);
    } catch (e) {
      toast.error("Purchase failed. Please try again.");
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const IconComponent = iconMap[contentTypes[selectedType]?.icon] || FileText;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-purple-400" />
            <span className="text-xl font-bold text-white">AI Content Studio</span>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="border-purple-400 text-purple-400 px-3 py-1" data-testid="credits-badge">
              <Zap className="h-3 w-3 mr-1" /> {user.credits} Credits
            </Badge>
            <Button variant="ghost" size="sm" onClick={() => setShowPricing(true)} className="text-gray-300" data-testid="buy-credits-btn">
              <CreditCard className="h-4 w-4 mr-2" /> Buy Credits
            </Button>
            <div className="flex items-center gap-2 text-gray-300">
              <User className="h-4 w-4" />
              <span className="text-sm">{user.name}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={onLogout} className="text-gray-400 hover:text-white" data-testid="logout-btn">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="generate" className="space-y-6">
          <TabsList className="bg-white/5 border border-white/10">
            <TabsTrigger value="generate" className="data-[state=active]:bg-purple-500" data-testid="tab-generate">
              <Sparkles className="h-4 w-4 mr-2" /> Generate
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-purple-500" data-testid="tab-history">
              <History className="h-4 w-4 mr-2" /> History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Input Section */}
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <IconComponent className="h-5 w-5 text-purple-400" />
                    Create Content
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Select content type and describe what you need
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Content Type</Label>
                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white" data-testid="content-type-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(contentTypes).map(([key, value]) => {
                          const Icon = iconMap[value.icon] || FileText;
                          return (
                            <SelectItem key={key} value={key}>
                              <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4" />
                                {value.name} ({value.credits} credit{value.credits > 1 ? 's' : ''})
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Topic / Subject</Label>
                    <Input
                      placeholder="e.g., Benefits of remote work for small businesses"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                      data-testid="topic-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Tone</Label>
                    <Select value={tone} onValueChange={setTone}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white" data-testid="tone-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {toneOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Additional Instructions (Optional)</Label>
                    <Textarea
                      placeholder="Any specific requirements, keywords to include, target audience..."
                      value={additionalInfo}
                      onChange={(e) => setAdditionalInfo(e.target.value)}
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 min-h-[100px]"
                      data-testid="additional-info-textarea"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    onClick={handleGenerate}
                    disabled={generating}
                    data-testid="generate-btn"
                  >
                    {generating ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...</>
                    ) : (
                      <><Sparkles className="h-4 w-4 mr-2" /> Generate Content ({contentTypes[selectedType]?.credits || 1} credit{(contentTypes[selectedType]?.credits || 1) > 1 ? 's' : ''})</>
                    )}
                  </Button>
                </CardFooter>
              </Card>

              {/* Output Section */}
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    Generated Content
                    {generatedContent && (
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(generatedContent)} className="text-purple-400" data-testid="copy-btn">
                        <Copy className="h-4 w-4 mr-1" /> Copy
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px] rounded-lg">
                    {generating ? (
                      <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <Loader2 className="h-8 w-8 animate-spin mb-4" />
                        <p>Creating your content...</p>
                      </div>
                    ) : generatedContent ? (
                      <div className="prose prose-invert max-w-none">
                        <pre className="whitespace-pre-wrap text-gray-300 font-sans text-sm leading-relaxed">
                          {generatedContent}
                        </pre>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <Sparkles className="h-12 w-12 mb-4 opacity-50" />
                        <p>Your generated content will appear here</p>
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Generation History</CardTitle>
                <CardDescription className="text-gray-400">Your previous content generations</CardDescription>
              </CardHeader>
              <CardContent>
                {history.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No generations yet. Create your first content!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {history.map((item) => {
                      const Icon = iconMap[contentTypes[item.content_type]?.icon] || FileText;
                      return (
                        <Card key={item.id} className="bg-white/5 border-white/10">
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4 text-purple-400" />
                                <CardTitle className="text-white text-base">{item.topic}</CardTitle>
                              </div>
                              <Badge variant="outline" className="text-gray-400 border-gray-600">
                                {contentTypes[item.content_type]?.name || item.content_type}
                              </Badge>
                            </div>
                            <CardDescription className="text-gray-500 text-xs">
                              {new Date(item.created_at).toLocaleString()} • {item.credits_used} credits used
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <p className="text-gray-400 text-sm line-clamp-3">{item.generated_content}</p>
                          </CardContent>
                          <CardFooter>
                            <Button variant="ghost" size="sm" onClick={() => copyToClipboard(item.generated_content)} className="text-purple-400">
                              <Copy className="h-4 w-4 mr-1" /> Copy Full Content
                            </Button>
                          </CardFooter>
                        </Card>
                      );
                    })}
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
          <DialogHeader>
            <DialogTitle className="text-white text-2xl">Purchase Credits</DialogTitle>
            <DialogDescription className="text-gray-400">
              Choose a plan to continue generating amazing content
            </DialogDescription>
          </DialogHeader>
          <div className="grid md:grid-cols-3 gap-4 mt-4">
            {[
              { key: "starter", name: "Starter", price: "$9", credits: "50" },
              { key: "pro", name: "Pro", price: "$29", credits: "200", popular: true },
              { key: "unlimited", name: "Unlimited", price: "$49/mo", credits: "∞" }
            ].map((plan) => (
              <Card key={plan.key} className={`${plan.popular ? 'border-purple-500 bg-purple-500/10' : 'bg-white/5 border-white/10'}`}>
                {plan.popular && <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-purple-500">Best Value</Badge>}
                <CardHeader className="text-center">
                  <CardTitle className="text-white">{plan.name}</CardTitle>
                  <div className="text-3xl font-bold text-white">{plan.price}</div>
                  <CardDescription className="text-purple-400">{plan.credits} credits</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button
                    className={`w-full ${plan.popular ? 'bg-purple-500 hover:bg-purple-600' : ''}`}
                    variant={plan.popular ? 'default' : 'outline'}
                    onClick={() => handlePurchase(plan.key)}
                    data-testid={`purchase-${plan.key}-btn`}
                  >
                    Purchase
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          <p className="text-gray-500 text-center text-sm mt-4">
            Demo mode: Credits are added instantly. In production, integrate with Stripe for real payments.
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Auth Component
const AuthScreen = ({ onAuth }) => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !name.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API}/users`, { email, name });
      localStorage.setItem('ai_content_user', JSON.stringify(res.data));
      onAuth(res.data);
      toast.success("Welcome to AI Content Studio!");
    } catch (e) {
      toast.error("Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/5 border-white/10">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Sparkles className="h-12 w-12 text-purple-400" />
          </div>
          <CardTitle className="text-2xl text-white">Get Started Free</CardTitle>
          <CardDescription className="text-gray-400">
            Create your account and get 3 free credits
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Name</Label>
              <Input
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                data-testid="auth-name-input"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Email</Label>
              <Input
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                data-testid="auth-email-input"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              disabled={loading}
              data-testid="auth-submit-btn"
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating account...</>
              ) : (
                "Start Creating Content"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

// Main App Component
function App() {
  const [user, setUser] = useState(null);
  const [showLanding, setShowLanding] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing user
    const savedUser = localStorage.getItem('ai_content_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        setShowLanding(false);
      } catch (e) {
        localStorage.removeItem('ai_content_user');
      }
    }
    setLoading(false);
  }, []);

  const handleGetStarted = () => {
    setShowLanding(false);
  };

  const handleAuth = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('ai_content_user');
    setUser(null);
    setShowLanding(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="App">
      <Toaster position="top-right" richColors />
      {showLanding ? (
        <LandingPage onGetStarted={handleGetStarted} />
      ) : user ? (
        <Dashboard user={user} setUser={setUser} onLogout={handleLogout} />
      ) : (
        <AuthScreen onAuth={handleAuth} />
      )}
    </div>
  );
}

export default App;
