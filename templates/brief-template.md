# Project Specification Template

Develop ${PROJECT_NAME}, a ${PROJECT_DESCRIPTION}. It should allow users to ${CORE_FUNCTIONALITY}. In this initial phase for this feature, let's call it "${PHASE_NAME}," let's have ${USER_SETUP_DESCRIPTION}.

## User Configuration

I want ${TOTAL_USER_COUNT} users in ${USER_CATEGORY_COUNT} different categories: ${USER_CATEGORIES_AND_COUNTS}. Let's create ${PROJECT_COUNT} different sample projects.

## Board Structure

Let's have the ${BOARD_TYPE} columns for the status of each task, such as ${COLUMN_NAMES}.

## Authentication

There will be ${AUTHENTICATION_SETUP} for this application as this is ${AUTHENTICATION_REASON}.

## Task Card Features

For each task in the UI for a task card, you should be able to:

- ${TASK_CARD_FEATURES}

## User Flow

When you first launch ${PROJECT_NAME}, it's going to ${INITIAL_SCREEN_BEHAVIOR}. ${LOGIN_FLOW_DESCRIPTION}.

When you click on a user, you go into the main view, which displays ${MAIN_VIEW_CONTENT}. When you click on a project, you open ${PROJECT_VIEW_DESCRIPTION}.

## Board Interaction

You're going to see the columns. You'll be able to ${BOARD_INTERACTION_FEATURES}.

## Visual Indicators

You will see ${VISUAL_INDICATORS} so you can quickly ${VISUAL_INDICATOR_PURPOSE}.

## Permission System

You can ${USER_PERMISSIONS_OWN_CONTENT}, but you can't ${USER_PERMISSIONS_OTHERS_CONTENT}.

---

## Template Variables Reference

### Project Identity

- `${PROJECT_NAME}` - Name of the application/project
- `${PROJECT_DESCRIPTION}` - Brief description of what the project is
- `${PHASE_NAME}` - Name of the current development phase
- `${CORE_FUNCTIONALITY}` - Main features the application should provide

### Users & Roles

- `${TOTAL_USER_COUNT}` - Total number of users (e.g., "five")
- `${USER_CATEGORY_COUNT}` - Number of different user types (e.g., "two")
- `${USER_CATEGORIES_AND_COUNTS}` - Description of user roles and quantities
- `${USER_SETUP_DESCRIPTION}` - How users are configured/managed

### Project Structure

- `${PROJECT_COUNT}` - Number of sample projects to create
- `${BOARD_TYPE}` - Type of board layout (e.g., "standard Kanban")
- `${COLUMN_NAMES}` - List of column names in quotes

### Authentication & Access

- `${AUTHENTICATION_SETUP}` - Authentication requirements
- `${AUTHENTICATION_REASON}` - Explanation for auth setup choice
- `${INITIAL_SCREEN_BEHAVIOR}` - What happens on app launch
- `${LOGIN_FLOW_DESCRIPTION}` - How users log in or select themselves

### Interface & Navigation

- `${MAIN_VIEW_CONTENT}` - What's shown in the main view after login
- `${PROJECT_VIEW_DESCRIPTION}` - What opens when clicking on a project

### Features & Interactions

- `${TASK_CARD_FEATURES}` - List of task card capabilities
- `${BOARD_INTERACTION_FEATURES}` - What users can do with the board
- `${VISUAL_INDICATORS}` - Visual cues for users
- `${VISUAL_INDICATOR_PURPOSE}` - What the visual cues help accomplish

### Permissions

- `${USER_PERMISSIONS_OWN_CONTENT}` - What users can do with their own content
- `${USER_PERMISSIONS_OTHERS_CONTENT}` - What users cannot do with others' content

---

## 🎯 **Project Health Monitoring & Development System Setup Prompt**

```
I need you to create a comprehensive project health monitoring and development system for my [PROJECT_TYPE] project. This system should provide real-time visibility into project health, enforce quality standards, and streamline development workflows.

## Core Requirements

### 1. Health Monitoring System
Create a `just status` command that provides comprehensive project health visibility:

**Status Indicators:**
- ✅ Green indicators for healthy components
- ❌ Red indicators for issues requiring attention
- Clear, actionable status messages

**What to Monitor:**
- Main project: package.json, dependencies, build state
- Sub-projects/modules: Individual health status
- Development tools: Linting, testing, documentation
- Infrastructure: CI/CD, deployment status
- Dependencies: Security, updates, compatibility

**Status Output Format:**
```

# [PROJECT_NAME] Status:

Main Project:
✅ package.json exists
✅ dependencies installed
✅ built successfully
✅ tests passing

Sub-projects:
module-a:
✅ package.json
✅ dependencies
✅ built
module-b:
❌ package.json missing
❌ dependencies not installed
❌ not built

Development Tools:
✅ linting configured
✅ testing setup
❌ documentation outdated

```

### 2. Development Workflow Commands
Create a comprehensive set of `just` recipes for common development tasks:

**Project Management:**
- `just new-[component]` - Create new components/modules
- `just list-[components]` - List available components
- `just build-[component]` - Build specific components
- `just dev-[component]` - Start development for specific components
- `just install-[component]` - Install dependencies for components

**Quality Assurance:**
- `just test` - Run all tests
- `just test-[component]` - Test specific components
- `just lint` - Run linting
- `just typecheck` - Type checking
- `just build` - Build all components
- `just clean` - Clean build artifacts

**Batch Operations:**
- `just build-all` - Build all components
- `just install-all` - Install all dependencies
- `just test-all` - Test all components
- `just clean-all` - Clean all build artifacts

**Documentation:**
- `just docs` - Show documentation overview
- `just [system]-docs` - Show specific system documentation
- `just help` - Show all available commands

### 3. Project Structure Standards
Establish clear project organization:

**Directory Structure:**
```

[project-root]/
├── [main-project]/
├── [sub-projects]/ # Individual components/modules
│ ├── [component-a]/
│ ├── [component-b]/
│ └── templates/ # Templates for new components
├── docs/ # Documentation
├── scripts/ # Utility scripts
├── [config-files] # Project configuration
└── Justfile # Development commands

````

**Required Files per Component:**
- `package.json` - Dependencies and scripts
- `[build-config]` - Build configuration
- `[type-config]` - Type checking configuration
- `README.md` - Component documentation
- `[test-config]` - Testing configuration

### 4. Quality Gates & Standards
Implement mandatory quality checks:

**Build-First Development:**
- All components must build successfully before development
- TDD approach: Template → Build → Test → Develop
- Red-Green-Refactor cycle for all changes

**Health Monitoring Requirements:**
- `just status` must be run before starting development
- `just status` must be run after completing development
- Red indicators block further development until resolved
- Green indicators required for all development work

**Consistency Standards:**
- Uniform project structure across all components
- Consistent dependency management
- Standardized build and test processes
- Clear documentation requirements

### 5. Documentation System
Create comprehensive documentation:

**Core Documentation:**
- `[PROJECT]_SPEC.md` - Project specification and standards
- `[PROJECT]_PLAN.md` - Implementation and development plan
- `STATUS_MONITORING_GUIDE.md` - Health monitoring guide
- `DEVELOPMENT_GUIDE.md` - Development workflow guide
- `[PROJECT]_CONSTITUTION.md` - Project governance and standards

**Documentation Standards:**
- Clear, actionable content
- Code examples and usage patterns
- Troubleshooting guides
- Best practices and standards
- Regular updates and maintenance

### 6. Justfile Implementation
Create a comprehensive Justfile with:

**Status Monitoring:**
```justfile
status:
    @echo "[PROJECT_NAME] Status:"
    @echo "====================="
    @echo "Main Project:"
    @if [ -f "package.json" ]; then echo "  ✅ package.json exists"; else echo "  ❌ package.json missing"; fi
    @if [ -d "node_modules" ]; then echo "  ✅ dependencies installed"; else echo "  ❌ dependencies not installed"; fi
    @if [ -d "dist" ]; then echo "  ✅ built"; else echo "  ❌ not built"; fi
    # Add more status checks as needed
````

**Component Management:**

```justfile
new-[component] name description:
    @echo "Creating new [component]: {{name}}"
    @echo "Description: {{description}}"
    @./scripts/create-new-[component].sh "{{name}}" "{{description}}"

list-[components]:
    @echo "Available [Components]:"
    @ls -1 [sub-projects]/ | grep -v templates || true

build-[component] component:
    @echo "Building [component]: {{component}}"
    @cd [sub-projects]/{{component}} && [build-command]

dev-[component] component:
    @echo "Starting development for: {{component}}"
    @cd [sub-projects]/{{component}} && [dev-command]
```

**Batch Operations:**

```justfile
build-all:
    @echo "Building all [components]..."
    @[main-build-command]
    @bash -c 'for [component] in [sub-projects]/*/; do if [ -d "$$[component]" ] && [ "$$(basename $$[component])" != "templates" ]; then echo "Building $$(basename $$[component])..."; cd "$$[component]" && [build-command] && cd ../..; fi; done'

install-all:
    @echo "Installing dependencies for all [components]..."
    @[main-install-command]
    @bash -c 'for [component] in [sub-projects]/*/; do if [ -d "$$[component]" ] && [ "$$(basename $$[component])" != "templates" ]; then echo "Installing dependencies for $$(basename $$[component])..."; cd "$$[component]" && [install-command] && cd ../..; fi; done'
```

### 7. Scripts and Automation

Create utility scripts:

**Component Creation Script:**

```bash
#!/bin/bash
# Script to create new [components]

if [ -z "$1" ] || [ -z "$2" ]; then
    echo "Usage: $0 <[component]-name> <[component]-description>"
    exit 1
fi

[COMPONENT_NAME]=$1
[COMPONENT_DESCRIPTION]=$2
[COMPONENT_DIR]="[sub-projects]/$[COMPONENT_NAME]"
TEMPLATE_DIR="[sub-projects]/templates"

echo "Creating new [component]: $[COMPONENT_NAME]"
echo "Description: $[COMPONENT_DESCRIPTION]"
echo "Location: $[COMPONENT_DIR]"

# Create component directory
mkdir -p "$[COMPONENT_DIR]"

# Copy template files
cp -r "$TEMPLATE_DIR"/* "$[COMPONENT_DIR]/"

# Replace placeholders
sed -i '' "s/{{[COMPONENT_NAME]}}/$[COMPONENT_NAME]/g" "$[COMPONENT_DIR]/package.json"
sed -i '' "s/{{[COMPONENT_DESCRIPTION]}}/$[COMPONENT_DESCRIPTION]/g" "$[COMPONENT_DIR]/package.json"

echo "✅ [Component] created successfully!"
echo ""
echo "Next steps:"
echo "1. cd $[COMPONENT_DIR]"
echo "2. [install-command]"
echo "3. [dev-command]"
```

### 8. Governance and Standards

Establish project governance:

**Constitution Document:**

- Core principles and standards
- Quality gates and requirements
- Development workflow requirements
- Health monitoring mandates
- Compliance requirements

**Standards Enforcement:**

- Mandatory status checks before development
- Required quality gates for all changes
- Consistent project structure requirements
- Documentation and testing requirements

## Implementation Guidelines

### Phase 1: Foundation

1. Create project structure and templates
2. Implement basic `just status` command
3. Set up core development commands
4. Create initial documentation

### Phase 2: Enhancement

1. Add comprehensive status monitoring
2. Implement batch operations
3. Create component management system
4. Add quality gates and standards

### Phase 3: Automation

1. Add utility scripts and automation
2. Implement CI/CD integration
3. Create comprehensive documentation
4. Add advanced monitoring and metrics

## Success Criteria

- **Health Visibility**: Clear, actionable status information
- **Development Efficiency**: Streamlined workflows and commands
- **Quality Assurance**: Mandatory quality gates and standards
- **Consistency**: Uniform project structure and processes
- **Documentation**: Comprehensive guides and standards
- **Automation**: Reduced manual work and human error

## Customization Notes

Replace the following placeholders with your project-specific values:

- `[PROJECT_TYPE]` - Your project type (e.g., "React", "Node.js", "Python")
- `[PROJECT_NAME]` - Your project name
- `[component]` - Your component type (e.g., "module", "service", "package")
- `[sub-projects]` - Your sub-project directory name
- `[build-command]` - Your build command (e.g., "npm run build", "make build")
- `[dev-command]` - Your development command (e.g., "npm run dev", "make dev")
- `[install-command]` - Your install command (e.g., "npm install", "pip install")

This system will provide comprehensive project health monitoring, streamlined development workflows, and enforced quality standards for any type of project.

```

## 🎯 **Key Benefits of This System**

1. **Universal Applicability**: Works for any project type (React, Node.js, Python, etc.)
2. **Comprehensive Monitoring**: Real-time visibility into all project aspects
3. **Quality Enforcement**: Mandatory health checks and quality gates
4. **Development Efficiency**: Streamlined workflows and batch operations
5. **Consistency**: Uniform structure and processes across all components
6. **Documentation**: Comprehensive guides and standards
7. **Automation**: Reduced manual work and human error
```
