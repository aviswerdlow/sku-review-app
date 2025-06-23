# SKU Variant Review App

A Next.js web application for SMEs to review and approve/reject AI-generated product variant groups.

## Features

- 📊 **Dashboard Overview**: See statistics on total groups, pending reviews, approved, and rejected groups
- 🔍 **Detailed Review Interface**: 
  - View parent product names and all variants
  - See AI reasoning for grouping
  - View common and varying attributes
  - Expand/collapse variant details
- ✅ **Approve Groups**: One-click approval for correct groupings
- ❌ **Reject with Feedback**: 
  - Provide specific rejection reasons
  - Add additional feedback for AI improvement
- 🎯 **Smart Filtering**: Filter by pending, approved, or rejected status
- 💾 **Import/Export**: 
  - Import JSON files from your Python notebook
  - Export reviewed results with feedback
- 🔄 **Persistent State**: Reviews are saved in browser localStorage

## Setup Instructions

1. **Install dependencies**:
```bash
cd /Users/aviswerdlow/Documents/Coding/sku-review-app
npm install
```

2. **Run the development server**:
```bash
npm run dev
```

3. **Open the app**:
Navigate to [http://localhost:3000](http://localhost:3000)

## How to Use

1. **Export data from your notebook**:
   - Run the comprehensive export from your Python notebook
   - This creates a JSON file with all variant groups

2. **Import into the review app**:
   - Click "Import JSON" button
   - Select your exported JSON file
   - Groups will appear for review

3. **Review groups**:
   - Click "Show Variants" to see all products in a group
   - Review the AI reasoning and attributes
   - Either:
     - Click "Approve Group" if correct
     - Click "Reject Group" and provide feedback if incorrect

4. **Export results**:
   - Click "Export Results" to download reviewed data
   - The export includes:
     - Approved groups ready for use
     - Rejected groups with feedback for AI improvement

## JSON Format

The app expects JSON in this format:
```json
{
  "groups": [
    {
      "parent_sku": "PARENT-1-00-11",
      "parent_title": "Ground Beef 90/10",
      "confidence": 0.85,
      "reasoning": "SKU pattern match with 2 variants",
      "variant_count": 2,
      "common_attributes": {"base_product": "ground_beef"},
      "varying_attributes": ["weight"],
      "variants": [
        {
          "sku": "1-00-11-1",
          "title": "1 lb Ground Beef 90/10",
          "attributes": {
            "weight": 1,
            "weight_unit": "lb"
          }
        }
      ]
    }
  ]
}
```

## Tech Stack

- **Next.js 14** - React framework
- **Shadcn UI** - Component library
- **Tailwind CSS** - Styling
- **TypeScript** - Type safety
- **Lucide Icons** - Icon library

## Future Enhancements

- Database integration (PostgreSQL/MongoDB)
- User authentication
- Bulk actions
- Export to multiple formats (CSV, Excel)
- API integration with AI system
- Real-time collaboration features
- Audit trail of all reviews