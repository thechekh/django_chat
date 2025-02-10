import React from 'react';
import { Popover, Button, Box } from '@mui/material';

interface ReactionPickerProps {
    anchorEl: HTMLElement | null;
    onClose: () => void;
    onSelect: (reaction: string) => void;
}

const REACTIONS = ["❤️", "😂", "😮", "😢", "👍"];

const ReactionPicker: React.FC<ReactionPickerProps> = ({ anchorEl, onClose, onSelect }) => {
    const open = Boolean(anchorEl);
    return (
        <Popover
            open={open}
            anchorEl={anchorEl}
            onClose={onClose}
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'left',
            }}
        >
            <Box p={1} display="flex">
                {REACTIONS.map(emoji => (
                    <Button
                        key={emoji}
                        onClick={() => {
                            onSelect(emoji);
                            onClose();
                        }}
                    >
                        {emoji}
                    </Button>
                ))}
            </Box>
        </Popover>
    );
};

export default ReactionPicker;