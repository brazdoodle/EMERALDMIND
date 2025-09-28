import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useUser } from "@/contexts/UserContext";
import { Edit3, Save, Settings, User, X } from "lucide-react";
import React, { useState } from "react";

const avatarBackgrounds = [
  { name: "Emerald", value: "from-emerald-500 to-teal-500" },
  { name: "Blue", value: "from-blue-500 to-purple-500" },
  { name: "Red", value: "from-red-500 to-pink-500" },
  { name: "Orange", value: "from-orange-500 to-yellow-500" },
  { name: "Green", value: "from-green-500 to-lime-500" },
  { name: "Purple", value: "from-purple-500 to-indigo-500" },
  { name: "Pink", value: "from-pink-500 to-rose-500" },
  { name: "Cyan", value: "from-cyan-500 to-blue-500" },
];

export default function UserProfileManager({ trigger = null }) {
  const { currentUser, actions, users = [] } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: currentUser?.name || "User",
    tagline: currentUser?.tagline || "ROM Hacking Enthusiast",
    backgroundColor:
      currentUser?.avatar?.backgroundColor || "from-emerald-500 to-teal-500",
  });
  const [settingsData, setSettingsData] = useState({
    expertMode: currentUser?.settings?.expertMode || false,
    notifications: currentUser?.settings?.notifications || true,
  });

  const handleSave = () => {
    // Update user profile
    actions.updateProfile({
      name: formData.name,
      tagline: formData.tagline,
      avatar: {
        ...currentUser.avatar,
        backgroundColor: formData.backgroundColor,
        value: formData.name.charAt(0).toUpperCase(),
      },
    });

    // Update user settings
    actions.updateSettings(settingsData);

    setIsOpen(false);
  };

  const [isCreating, setIsCreating] = useState(false);
  const [newUserName, setNewUserName] = useState("");

  const handleCreateUser = () => {
    if (!newUserName.trim()) return;
    const userPayload = {
      name: newUserName.trim(),
      tagline: "New workspace",
      backgroundColor: avatarBackgrounds[0].value,
      role: "user",
    };
    actions.createUser(userPayload);
    setNewUserName("");
    setIsCreating(false);
    // Open the profile editor for the newly created user so they can edit details immediately
    setIsOpen(true);
  };

  const handleSwitchUser = (userId) => {
    actions.switchUser(userId);
    // Immediately update the form to reflect the newly-selected user
    const selected = (users || []).find((u) => u.id === userId) || currentUser;
    if (selected) {
      setFormData({
        name: selected.name || "User",
        tagline: selected.tagline || "ROM Hacking Enthusiast",
        backgroundColor:
          selected.avatar?.backgroundColor || "from-emerald-500 to-teal-500",
      });
      setSettingsData({
        expertMode: selected.settings?.expertMode || false,
        notifications:
          selected.settings?.notifications !== undefined
            ? selected.settings.notifications
            : true,
      });
    }
    // Keep the dialog open so edits can be made immediately
  };

  const handleDeleteUser = (userId) => {
    if (
      !confirm(
        "Delete this user and all their local projects? This cannot be undone."
      )
    )
      return;
    actions.deleteUser(userId);
  };

  const handleCancel = () => {
    // Reset form data
    setFormData({
      name: currentUser?.name || "User",
      tagline: currentUser?.tagline || "ROM Hacking Enthusiast",
      backgroundColor:
        currentUser?.avatar?.backgroundColor || "from-emerald-500 to-teal-500",
    });
    setSettingsData({
      expertMode: currentUser?.settings?.expertMode || false,
      notifications: currentUser?.settings?.notifications || true,
    });
    setIsOpen(false);
  };

  const DefaultTrigger = React.forwardRef(({ ...props }, ref) => (
    <Button
      ref={ref}
      {...props}
      variant="ghost"
      size="sm"
      className="h-8 px-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
    >
      <Edit3 className="w-4 h-4" />
    </Button>
  ));

  const TriggerComponent = trigger || <DefaultTrigger />;

  const handleOpenChange = (open) => {
    setIsOpen(open);
    if (open) {
      setFormData({
        name: currentUser?.name || "User",
        tagline: currentUser?.tagline || "ROM Hacking Enthusiast",
        backgroundColor:
          currentUser?.avatar?.backgroundColor ||
          "from-emerald-500 to-teal-500",
      });
      setSettingsData({
        expertMode: currentUser?.settings?.expertMode || false,
        notifications:
          currentUser?.settings?.notifications !== undefined
            ? currentUser.settings.notifications
            : true,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{TriggerComponent}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            User Profile Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* User Selection Display */}
          <div className="space-y-2">
            <Label>Current Profile</Label>
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <div
                className={`w-8 h-8 bg-gradient-to-r ${
                  currentUser?.avatar?.backgroundColor ||
                  "from-emerald-500 to-teal-500"
                } rounded-full flex items-center justify-center`}
              >
                <span className="text-white font-bold text-sm">
                  {currentUser?.avatar?.value || "U"}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {currentUser?.name || "User"}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Profile editing only
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              To switch profiles or create new ones, use the Profile Management
              section in Settings.
            </p>
          </div>
          {/* Profile Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              <User className="w-4 h-4" />
              Profile
            </div>

            {/* Avatar Preview */}
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 bg-gradient-to-r ${formData.backgroundColor} rounded-full flex items-center justify-center`}
              >
                <span className="text-white font-bold text-lg">
                  {formData.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {formData.name}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {formData.tagline}
                </p>
              </div>
            </div>

            {/* Name Input */}
            <div className="space-y-2">
              <Label htmlFor="name">Display Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Enter your display name"
                className="bg-white dark:bg-slate-900"
              />
            </div>

            {/* Tagline Input */}
            <div className="space-y-2">
              <Label htmlFor="tagline">Tagline</Label>
              <Input
                id="tagline"
                value={formData.tagline}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, tagline: e.target.value }))
                }
                placeholder="Enter your tagline"
                className="bg-white dark:bg-slate-900"
              />
            </div>

            {/* Avatar Color */}
            <div className="space-y-2">
              <Label htmlFor="avatar-color">Avatar Color</Label>
              <Select
                value={formData.backgroundColor}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, backgroundColor: value }))
                }
              >
                <SelectTrigger className="bg-white dark:bg-slate-900">
                  <SelectValue placeholder="Select avatar color" />
                </SelectTrigger>
                <SelectContent>
                  {avatarBackgrounds.map((bg) => (
                    <SelectItem key={bg.value} value={bg.value}>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 bg-gradient-to-r ${bg.value} rounded`}
                        ></div>
                        {bg.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Settings Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 border-t border-slate-200 dark:border-slate-700 pt-4">
              <Settings className="w-4 h-4" />
              Settings
            </div>

            {/* Expert Mode removed - feature not implemented */}

            {/* Notifications */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifications">Notifications</Label>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Show system notifications and alerts
                </p>
              </div>
              <Switch
                id="notifications"
                checked={settingsData.notifications}
                onCheckedChange={(checked) =>
                  setSettingsData((prev) => ({
                    ...prev,
                    notifications: checked,
                  }))
                }
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button
              onClick={handleSave}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
            <Button onClick={handleCancel} variant="outline" className="flex-1">
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
