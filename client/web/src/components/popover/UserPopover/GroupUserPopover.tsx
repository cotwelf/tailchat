import { IconBtn } from '@/components/IconBtn';
import { UserName } from '@/components/UserName';
import { fetchImagePrimaryColor } from '@/utils/image-helper';
import { Space, Tag, Tooltip } from 'antd';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { getTextColorHex } from 'tailchat-design';
import {
  createDMConverse,
  getGroupConfigWithInfo,
  GroupInfo,
  t,
  useAsyncRequest,
  UserBaseInfo,
  useUserId,
} from 'tailchat-shared';
import { UserProfileContainer } from '../../UserProfileContainer';
import { usePluginUserExtraInfo } from './usePluginUserExtraInfo';

export const GroupUserPopover: React.FC<{
  userInfo: UserBaseInfo;
  groupInfo: GroupInfo;
}> = React.memo((props) => {
  const { userInfo, groupInfo } = props;
  const userId = userInfo._id;
  const userExtra = userInfo.extra ?? {};
  const roleNames = getUserRoleNames(userId, groupInfo);
  const { hideGroupMemberDiscriminator, disableCreateConverseFromGroup } =
    getGroupConfigWithInfo(groupInfo);
  const pluginUserExtraInfoEl = usePluginUserExtraInfo(userExtra);
  const navigate = useNavigate();
  const currentUserId = useUserId();

  const allowSendMessage =
    !hideGroupMemberDiscriminator &&
    !disableCreateConverseFromGroup &&
    currentUserId !== userId;

  const [, handleCreateConverse] = useAsyncRequest(async () => {
    const converse = await createDMConverse([userId]);
    navigate(`/main/personal/converse/${converse._id}`);
  }, [navigate]);

  useEffect(() => {
    if (userInfo.avatar) {
      fetchImagePrimaryColor(userInfo.avatar).then((rgba) => {
        console.log('fetchImagePrimaryColor', rgba);
      });
    }
  }, [userInfo.avatar]);

  return (
    <div className="w-80 -mx-4 -my-3 bg-inherit">
      <UserProfileContainer userInfo={userInfo}>
        <div className="text-xl">
          <span className="font-semibold">
            <UserName userId={userId} />
          </span>
          {!hideGroupMemberDiscriminator && (
            <span className="opacity-60 ml-1">#{userInfo.discriminator}</span>
          )}
        </div>

        <Space size={4} wrap={true} className="py-1">
          {groupInfo.owner === userId && <Tag color="gold">{t('创建者')}</Tag>}

          {userInfo.temporary && <Tag color="processing">{t('游客')}</Tag>}

          {roleNames.map((name) => (
            <Tag key={name} color={getTextColorHex(name)}>
              {name}
            </Tag>
          ))}
        </Space>

        <div className="pt-2">{pluginUserExtraInfoEl}</div>

        <div className="text-right">
          {allowSendMessage && (
            <Tooltip title={t('发送消息')}>
              <IconBtn
                icon="mdi:message-processing-outline"
                onClick={handleCreateConverse}
              />
            </Tooltip>
          )}
        </div>
      </UserProfileContainer>
    </div>
  );
});
GroupUserPopover.displayName = 'GroupUserPopover';

/**
 * 获取用户的角色名列表
 */
function getUserRoleNames(userId: string, groupInfo: GroupInfo) {
  const roles = groupInfo.members.find((m) => m.userId === userId)?.roles ?? [];
  const roleNames = groupInfo.roles
    .filter((r) => roles.includes(r._id))
    .map((r) => r.name);

  return roleNames;
}
