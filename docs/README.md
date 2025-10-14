# CropGuard Documentation

This folder contains comprehensive documentation for the CropGuard project.

## 📚 Documentation Index

### Disease Mapping System
The disease mapping system connects your ML model predictions to your database disease IDs and enables automatic routing.

| Document | Purpose | When to Use |
|----------|---------|-------------|
| [**Implementation Summary**](IMPLEMENTATION_SUMMARY.md) | Overview of the complete system | **Start here** - understand what was built |
| [**Visual Guide**](DISEASE_MAPPING_VISUAL_GUIDE.md) | Diagrams and visual explanations | Understanding the architecture |
| [**Complete Guide**](DISEASE_MAPPING_GUIDE.md) | Full documentation and API reference | In-depth learning and reference |
| [**Quick Add Disease**](QUICK_ADD_DISEASE.md) | Fast reference for adding diseases | Adding a new disease |
| [**Model Retraining Checklist**](MODEL_RETRAINING_CHECKLIST.md) | Step-by-step for model updates | Retraining your ML model |

### Other Features
| Document | Purpose |
|----------|---------|
| [Caching Implementation](CACHING_IMPLEMENTATION.md) | Disease data caching system |
| [Cloudinary Integration](CLOUDINARY_INTEGRATION.md) | Image upload and storage |
| [History Button Migration](HISTORY_BUTTON_MIGRATION.md) | Scan history feature |
| [Image Upload Fix](IMAGE_UPLOAD_FIX.md) | Image handling improvements |
| [Logger Implementation](LOGGER_IMPLEMENTATION.md) | Logging system |
| [Profile Caching](PROFILE_CACHING_IMPLEMENTATION.md) | User profile caching |
| [Scan History Feature](SCAN_HISTORY_FEATURE.md) | Scan history functionality |
| [Scan History Quick Guide](SCAN_HISTORY_QUICK_GUIDE.md) | Quick reference for scan history |

## 🚀 Quick Start

### New to the Disease Mapping System?
1. Read [Implementation Summary](IMPLEMENTATION_SUMMARY.md) (5 min)
2. Review [Visual Guide](DISEASE_MAPPING_VISUAL_GUIDE.md) (10 min)
3. Skim [Complete Guide](DISEASE_MAPPING_GUIDE.md) (bookmark for later)

### Need to Add a Disease?
→ Go to [Quick Add Disease](QUICK_ADD_DISEASE.md)

### Retraining Your Model?
→ Follow [Model Retraining Checklist](MODEL_RETRAINING_CHECKLIST.md)

## 🎯 Common Tasks

### Adding a New Disease
```
1. Read: QUICK_ADD_DISEASE.md
2. Add to: disease_data table (Supabase)
3. Update: lib/diseaseMapping.ts
4. Test and deploy
```

### Understanding the System
```
1. Start: IMPLEMENTATION_SUMMARY.md
2. Visualize: DISEASE_MAPPING_VISUAL_GUIDE.md
3. Deep dive: DISEASE_MAPPING_GUIDE.md
```

### Troubleshooting
```
1. Check: DISEASE_MAPPING_GUIDE.md → Troubleshooting section
2. Review: lib/diseaseMapping.ts (comments)
3. Debug: Use logging utilities
```

## 📖 Document Descriptions

### IMPLEMENTATION_SUMMARY.md
**What it covers:**
- Complete overview of what was built
- Problem and solution explanation
- Key features and benefits
- Quick reference guide

**Best for:** Getting up to speed quickly

### DISEASE_MAPPING_VISUAL_GUIDE.md
**What it covers:**
- Data flow diagrams
- Visual examples
- UI changes
- Step-by-step illustrations

**Best for:** Visual learners, understanding architecture

### DISEASE_MAPPING_GUIDE.md
**What it covers:**
- Complete system documentation
- API reference
- Architecture details
- Best practices
- Troubleshooting
- Examples

**Best for:** Reference material, deep understanding

### QUICK_ADD_DISEASE.md
**What it covers:**
- 3-step process to add diseases
- Common patterns
- Common mistakes
- Quick checklist

**Best for:** Daily use when adding diseases

### MODEL_RETRAINING_CHECKLIST.md
**What it covers:**
- Pre/during/post training steps
- Integration workflow
- Testing procedures
- Rollback plans
- Version tracking

**Best for:** Model updates and retraining

## 🔗 Related Files

### Code Files
- `lib/diseaseMapping.ts` - Central mapping configuration
- `app/(tabs)/scan.tsx` - Scan screen with routing
- `app/details/[diseaseId].tsx` - Disease detail page

### Database
- `disease_data` table - Disease information storage
- `scan_activity` table - Scan logging

## 💡 Tips

- **Bookmark** `QUICK_ADD_DISEASE.md` for frequent reference
- **Keep** `DISEASE_MAPPING_GUIDE.md` open when troubleshooting
- **Follow** `MODEL_RETRAINING_CHECKLIST.md` step-by-step when updating model
- **Reference** code comments in `lib/diseaseMapping.ts`

## 🆘 Getting Help

1. **Search** the appropriate guide for your task
2. **Check** the troubleshooting section in guides
3. **Review** code comments in implementation files
4. **Test** with debug logging to understand behavior

## 📝 Contributing to Documentation

When updating docs:
- Keep examples up to date
- Add new patterns discovered
- Document edge cases
- Include troubleshooting tips
- Update version numbers
- Maintain consistency across docs

---

**Need help deciding which doc to read?**

- "How does this work?" → [Visual Guide](DISEASE_MAPPING_VISUAL_GUIDE.md)
- "I need to add a disease" → [Quick Add](QUICK_ADD_DISEASE.md)
- "What's the API?" → [Complete Guide](DISEASE_MAPPING_GUIDE.md)
- "Retraining model" → [Retraining Checklist](MODEL_RETRAINING_CHECKLIST.md)
- "What got built?" → [Implementation Summary](IMPLEMENTATION_SUMMARY.md)
