// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 The 25-ji-code-de Team

import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Chip,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { SHORTCUTS_CONFIG, getDisplayKey } from '../constants/shortcuts'

interface ShortcutsHelpDialogProps {
  open: boolean
  onClose: () => void
}

export default function ShortcutsHelpDialog({ open, onClose }: ShortcutsHelpDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">快捷键帮助</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            💡 提示：输入框聚焦时，单键快捷键（位置、样式、开关）将被禁用
          </Typography>
        </Box>

        {SHORTCUTS_CONFIG.map((category, categoryIndex) => (
          <Box key={categoryIndex} sx={{ mb: 3 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                mb: 1,
                color: 'primary.main',
              }}
            >
              {category.name}
            </Typography>
            <Table size="small">
              <TableBody>
                {category.shortcuts.map((shortcut, shortcutIndex) => (
                  <TableRow key={shortcutIndex} hover>
                    <TableCell sx={{ width: '40%', py: 1 }}>
                      <Box display="flex" gap={0.5} alignItems="center" flexWrap="wrap">
                        {shortcut.keys.map((key, keyIndex) => (
                          <Box key={keyIndex} display="flex" alignItems="center" gap={0.5}>
                            <Chip
                              label={getDisplayKey(key)}
                              size="small"
                              sx={{
                                fontFamily: 'monospace',
                                fontWeight: 600,
                                fontSize: '0.75rem',
                                height: 24,
                              }}
                            />
                            {keyIndex < shortcut.keys.length - 1 && (
                              <Typography
                                variant="body2"
                                component="span"
                                sx={{ color: 'text.secondary', mx: 0.25 }}
                              >
                                +
                              </Typography>
                            )}
                          </Box>
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 1 }}>
                      <Typography variant="body2">{shortcut.description}</Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        ))}
      </DialogContent>
    </Dialog>
  )
}
