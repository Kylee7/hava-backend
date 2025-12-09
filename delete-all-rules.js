const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
.then(() => {
    console.log('✅ Connected to MongoDB');
    deleteAllRules();
})
.catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
});

async function deleteAllRules() {
    try {
        const RuleSection = require('./models/RuleSection');
        
        // Delete all rules
        const result = await RuleSection.deleteMany({});
        
        console.log(`✅ تم حذف ${result.deletedCount} قانون بنجاح!`);
        console.log('✅ قاعدة البيانات نظيفة - يمكنك إضافة القوانين الجديدة الآن');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error deleting rules:', error.message);
        process.exit(1);
    }
}
