# PocketBase Collection Schemas - Quick Reference

This document provides a quick reference for creating the PocketBase collections for your FlowBoard application.

## Collection Creation Summary

### 1. users (Auth Collection - Modify Existing)
- **Type**: Auth Collection (already exists)
- **Additional Fields**:
  - `name` (Text, Required, Max: 100)
  - `avatar` (File, Optional, Max: 1, Size: 5MB, Types: image/*)
  - `phone` (Text, Optional, Max: 20)
  - `twoFactor` (Bool, Optional, Default: false)

### 2. boards (Base Collection)
- **Fields**:
  - `title` (Text, Required, Max: 200)
  - `description` (Text, Optional, Max: 1000)
  - `user` (Relation → users, Required, Max: 1, Cascade delete)

### 3. lists (Base Collection)
- **Fields**:
  - `title` (Text, Required, Max: 100)
  - `board` (Relation → boards, Required, Max: 1, Cascade delete)
  - `position` (Number, Required, Min: 0)

### 4. cards (Base Collection)
- **Fields**:
  - `title` (Text, Required, Max: 200)
  - `description` (Text, Optional, Max: 2000)
  - `list` (Relation → lists, Required, Max: 1, Cascade delete)
  - `position` (Number, Required, Min: 0)
  - `dueDate` (Date, Optional)
  - `recurrenceRule` (Text, Optional, Max: 500)
  - `labels` (Relation → labels, Optional, Max: 10)

### 5. labels (Base Collection)
- **Fields**:
  - `name` (Text, Required, Max: 50)
  - `color` (Text, Required, Max: 7, Pattern: ^#[0-9A-Fa-f]{6}$)
  - `board` (Relation → boards, Required, Max: 1, Cascade delete)

## API Rules Template

For all collections, use these API rule patterns:

### users Collection
```
List/Search: @request.auth.id != ""
View: @request.auth.id != "" && (@request.auth.id = id || @collection.boards.user.id ?= @request.auth.id)
Create: @request.auth.id = ""
Update: @request.auth.id = id
Delete: @request.auth.id = id
```

### boards Collection
```
List/Search: @request.auth.id != "" && user.id = @request.auth.id
View: @request.auth.id != "" && user.id = @request.auth.id
Create: @request.auth.id != "" && @request.data.user = @request.auth.id
Update: @request.auth.id != "" && user.id = @request.auth.id
Delete: @request.auth.id != "" && user.id = @request.auth.id
```

### lists Collection
```
List/Search: @request.auth.id != "" && board.user.id = @request.auth.id
View: @request.auth.id != "" && board.user.id = @request.auth.id
Create: @request.auth.id != "" && board.user.id = @request.auth.id
Update: @request.auth.id != "" && board.user.id = @request.auth.id
Delete: @request.auth.id != "" && board.user.id = @request.auth.id
```

### cards Collection
```
List/Search: @request.auth.id != "" && list.board.user.id = @request.auth.id
View: @request.auth.id != "" && list.board.user.id = @request.auth.id
Create: @request.auth.id != "" && list.board.user.id = @request.auth.id
Update: @request.auth.id != "" && list.board.user.id = @request.auth.id
Delete: @request.auth.id != "" && list.board.user.id = @request.auth.id
```

### labels Collection
```
List/Search: @request.auth.id != "" && board.user.id = @request.auth.id
View: @request.auth.id != "" && board.user.id = @request.auth.id
Create: @request.auth.id != "" && board.user.id = @request.auth.id
Update: @request.auth.id != "" && board.user.id = @request.auth.id
Delete: @request.auth.id != "" && board.user.id = @request.auth.id
```

## Environment Configuration

Create a `.env` file in your project root:
```
VITE_POCKETBASE_URL=http://localhost:8090
```

## Quick Setup Checklist

- [ ] Start PocketBase: `./pocketbase serve`
- [ ] Access admin: http://localhost:8090/_/
- [ ] Create admin account
- [ ] Modify users collection (add fields)
- [ ] Create boards collection
- [ ] Create lists collection  
- [ ] Create cards collection
- [ ] Create labels collection
- [ ] Set API rules for all collections
- [ ] Create .env file with VITE_POCKETBASE_URL
- [ ] Test with frontend application

## Data Flow

```
User creates Board → Board contains Lists → Lists contain Cards → Cards can have Labels
```

This schema supports all the functionality in your FlowBoard frontend application including user authentication, board management, drag-and-drop functionality, and label organization.