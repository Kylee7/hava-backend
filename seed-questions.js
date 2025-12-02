const mongoose = require('mongoose');
const Question = require('./models/Question');
require('dotenv').config();

const questions = [
    // Basic Questions (Always shown, in order)
    {
        text: 'ما هو اسمك الحقيقي؟',
        type: 'text',
        isRequired: true,
        isBasic: true,
        order: 1,
        placeholder: 'أدخل اسمك الحقيقي',
        validation: {
            minLength: 2,
            maxLength: 50
        },
        active: true
    },
    {
        text: 'كم عمرك؟',
        type: 'number',
        isRequired: true,
        isBasic: true,
        order: 2,
        placeholder: 'أدخل عمرك',
        validation: {
            min: 13,
            max: 100
        },
        active: true
    },
    {
        text: 'ما هي دولتك؟',
        type: 'text',
        isRequired: true,
        isBasic: true,
        order: 3,
        placeholder: 'أدخل اسم دولتك',
        validation: {
            minLength: 2,
            maxLength: 50
        },
        active: true
    },

    // Random Questions (5 will be randomly selected from these)
    {
        text: 'لماذا تريد الانضمام إلى Perfect CFW؟',
        type: 'textarea',
        isRequired: true,
        isBasic: false,
        placeholder: 'اشرح سبب رغبتك في الانضمام',
        validation: {
            minLength: 50,
            maxLength: 500
        },
        active: true
    },
    {
        text: 'هل لديك خبرة سابقة في سيرفرات Roleplay؟',
        type: 'textarea',
        isRequired: true,
        isBasic: false,
        placeholder: 'اذكر خبرتك في سيرفرات الرول بلاي',
        validation: {
            minLength: 20,
            maxLength: 300
        },
        active: true
    },
    {
        text: 'كم ساعة يمكنك اللعب يومياً؟',
        type: 'text',
        isRequired: true,
        isBasic: false,
        placeholder: 'مثال: 2-4 ساعات',
        validation: {
            minLength: 2,
            maxLength: 50
        },
        active: true
    },
    {
        text: 'هل تمتلك ميكروفون بجودة جيدة؟',
        type: 'text',
        isRequired: true,
        isBasic: false,
        placeholder: 'نعم/لا',
        active: true
    },
    {
        text: 'ما هو أسلوب اللعب المفضل لديك؟',
        type: 'textarea',
        isRequired: true,
        isBasic: false,
        placeholder: 'اشرح أسلوب لعبك المفضل',
        validation: {
            minLength: 30,
            maxLength: 300
        },
        active: true
    },
    {
        text: 'هل قرأت قوانين السيرفر؟',
        type: 'text',
        isRequired: true,
        isBasic: false,
        placeholder: 'نعم/لا',
        active: true
    },
    {
        text: 'ما هي الوظيفة التي تفضل لعبها في السيرفر؟',
        type: 'text',
        isRequired: true,
        isBasic: false,
        placeholder: 'مثال: شرطي، طبيب، تاجر',
        validation: {
            minLength: 3,
            maxLength: 100
        },
        active: true
    },
    {
        text: 'هل سبق وتم حظرك من أي سيرفر؟ ولماذا؟',
        type: 'textarea',
        isRequired: true,
        isBasic: false,
        placeholder: 'كن صريحاً في إجابتك',
        validation: {
            minLength: 10,
            maxLength: 300
        },
        active: true
    },
    {
        text: 'كيف سمعت عن Perfect CFW؟',
        type: 'text',
        isRequired: true,
        isBasic: false,
        placeholder: 'مثال: صديق، يوتيوب، إعلان',
        validation: {
            minLength: 5,
            maxLength: 100
        },
        active: true
    },
    {
        text: 'ما الذي يجعلك مميزاً عن باقي المتقدمين؟',
        type: 'textarea',
        isRequired: true,
        isBasic: false,
        placeholder: 'اشرح ما يميزك',
        validation: {
            minLength: 30,
            maxLength: 400
        },
        active: true
    },
    {
        text: 'هل أنت ملتزم بقوانين الرول بلاي؟',
        type: 'text',
        isRequired: true,
        isBasic: false,
        placeholder: 'نعم/لا',
        active: true
    },
    {
        text: 'هل يمكنك العمل ضمن فريق؟',
        type: 'textarea',
        isRequired: true,
        isBasic: false,
        placeholder: 'اشرح قدرتك على العمل الجماعي',
        validation: {
            minLength: 20,
            maxLength: 200
        },
        active: true
    }
];

async function seedQuestions() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing questions
        await Question.deleteMany({});
        console.log('🗑️  Cleared existing questions');

        // Insert new questions
        await Question.insertMany(questions);
        console.log(`✅ Inserted ${questions.length} questions`);

        console.log('\n📊 Summary:');
        console.log(`   - Basic questions: ${questions.filter(q => q.isBasic).length}`);
        console.log(`   - Random questions: ${questions.filter(q => !q.isBasic).length}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding questions:', error);
        process.exit(1);
    }
}

seedQuestions();
