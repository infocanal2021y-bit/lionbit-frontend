import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Layout } from '../components/layout/Layout';
import { transactionsAPI } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/ui/table';
import { Download, FileText, Filter } from 'lucide-react';
import { toast } from 'sonner';

export const TransactionsPage = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    const fetchTransactions = async () => {
        try {
            const response = await transactionsAPI.getAllHistory();
            const data = response?.data?.transactions;
            setTransactions(Array.isArray(data) ? data : []);
        } catch (error) {
            toast.error('Failed to load transactions');
            setTransactions([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    const handleExportCSV = async () => {
        try {
            const response = await transactionsAPI.exportCSV();
            const blob = new Blob([response.data], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'transactions.csv';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast.success('Transactions exported successfully');
        } catch {
            toast.error('Failed to export transactions');
        }
    };

    // SAFE ARRAY
    const safeTransactions = Array.isArray(transactions) ? transactions : [];

    // FILTERED
    const filteredTransactions = safeTransactions.filter((tx) => {
        if (filter === 'all') return true;
        return tx.transaction_type === filter;
    });

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <Layout>
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-between items-center"
                >
                    <div>
                        <h1 className="text-3xl font-bold text-white">
                            Transaction History
                        </h1>
                        <p className="text-slate-500">
                            View all your past transactions
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <Select value={filter} onValueChange={setFilter}>
                            <SelectTrigger className="w-36 bg-slate-900 border-slate-800 text-white">
                                <Filter className="w-4 h-4 mr-2" />
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-slate-800">
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="deposit">Deposits</SelectItem>
                                <SelectItem value="withdraw">Withdrawals</SelectItem>
                                <SelectItem value="transfer">Transfers</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button
                            onClick={handleExportCSV}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Export
                        </Button>
                    </div>
                </motion.div>

                {/* Table */}
                <Card className="bg-slate-900/70 border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <FileText className="w-5 h-5 text-emerald-400" />
                            All Transactions ({filteredTransactions.length})
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="p-0">
                        {loading ? (
                            <div className="p-8 text-center text-slate-400">
                                Loading...
                            </div>
                        ) : filteredTransactions.length === 0 ? (
                            <div className="p-12 text-center text-slate-500">
                                No transactions found
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Reference</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Date</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredTransactions.map((tx, index) => (
                                            <TableRow key={tx.id || index}>
                                                <TableCell>
                                                    {tx.transaction_reference || tx.id}
                                                </TableCell>
                                                <TableCell>
                                                    {tx.transaction_type}
                                                </TableCell>
                                                <TableCell>
                                                    ${tx.amount}
                                                </TableCell>
                                                <TableCell>
                                                    {formatDate(tx.created_at)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
};

export default TransactionsPage;
