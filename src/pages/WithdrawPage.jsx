import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Layout } from '../components/layout/Layout';
import { accountsAPI, transactionsAPI } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Upload, Loader2, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export const WithdrawPage = () => {
    const [accounts, setAccounts] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState('');
    const [amount, setAmount] = useState('');
    const [currency, setCurrency] = useState('USD');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const response = await accountsAPI.getAll();

                // 🔥 BLINDADO
                const data = response?.data?.accounts || response?.data;

                const safeAccounts = Array.isArray(data) ? data : [];

                setAccounts(safeAccounts);

                if (safeAccounts.length > 0) {
                    setSelectedAccount(safeAccounts[0].id);
                }
            } catch (error) {
                setAccounts([]);
                toast.error('Failed to load accounts');
            }
        };

        fetchAccounts();
    }, []);

    const getSelectedAccountBalance = () => {
        const safeAccounts = Array.isArray(accounts) ? accounts : [];

        const account = safeAccounts.find(acc => acc.id === selectedAccount);

        if (!account) return 0;

        return currency === 'USD'
            ? account.balance_usd || 0
            : account.balance_eur || 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const numAmount = parseFloat(amount);

        if (!selectedAccount || !amount || numAmount <= 0) {
            toast.error('Please fill in all required fields');
            return;
        }

        if (numAmount > getSelectedAccountBalance()) {
            toast.error('Insufficient funds in this account');
            return;
        }

        setLoading(true);

        try {
            await transactionsAPI.create({
                account_id: selectedAccount,
                transaction_type: 'withdraw',
                amount: numAmount,
                currency,
                description: description || undefined,
            });

            setSuccess(true);
            toast.success('Withdrawal request submitted! Awaiting admin approval.');
            setAmount('');
            setDescription('');
            setTimeout(() => setSuccess(false), 3000);

        } catch (error) {
            toast.error(error.response?.data?.detail || 'Withdrawal failed');
        } finally {
            setLoading(false);
        }
    };

    const currentBalance = getSelectedAccountBalance();

return (
  <Layout>
    <div className="max-w-2xl mx-auto space-y-8">

      <div>
        <h1 className="text-3xl font-bold text-white">Request Withdrawal</h1>
        <p className="text-slate-500 mt-1">Withdraw funds from your account</p>
      </div>

      <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
        <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5" />
        <div>
          <p className="text-amber-400 font-medium">Admin Approval Required</p>
          <p className="text-sm text-amber-400/70 mt-1">
            Withdrawal requests require admin approval before funds are deducted.
          </p>
        </div>
      </div>

      <Card className="bg-slate-900/70 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Withdraw Funds</CardTitle>
          <CardDescription className="text-slate-500">
            Request will be processed within 24 hours
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">

            <div className="space-y-2">
              <Label className="text-slate-300">Select Account</Label>

              <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                <SelectTrigger className="bg-slate-950 border-slate-800 text-white">
                  <SelectValue placeholder="Choose an account" />
                </SelectTrigger>

                <SelectContent className="bg-slate-900 border-slate-800">
                  {Array.isArray(accounts) &&
                    accounts.map((acc) => (
                      <SelectItem key={acc.id} value={acc.id} className="text-white">
                        {acc.account_type} Account
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              {selectedAccount && (
                <p className="text-sm text-slate-500">
                  Available:
                  <span className="font-mono text-emerald-400 ml-2">
                    {currency === 'USD' ? '$' : '€'}
                    {currentBalance.toFixed(2)}
                  </span>
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Amount</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={currentBalance}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Currency</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger className="bg-slate-950 border-slate-800 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800">
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Reason (Optional)</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-slate-950 border-slate-800 text-white"
              />
            </div>

            <Button
              type="submit"
              disabled={loading || success}
              className="w-full bg-red-500 hover:bg-red-600 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : success ? (
                <>
                  <Clock className="w-4 h-4 mr-2" />
                  Request Submitted!
                </>
              ) : (
                'Request Withdrawal'
              )}
            </Button>

          </form>
        </CardContent>
      </Card>

    </div>
  </Layout>
);

export default WithdrawPage;
